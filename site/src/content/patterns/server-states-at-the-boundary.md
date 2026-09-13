---
title: Server states modeled at the boundary
tag: api
problem: >-
  UIs lie about the network when the happy path is the only path anyone
  built: spinners that never resolve, error states nobody has seen, retry
  flows discovered in production. Testing those states against a real
  backend means fixture databases and flaky CI; mocking them ad hoc per
  test means every story re-invents the failure.
decision: >-
  Each entity ships named server scenarios as MSW handlers — `loading`
  (never resolves), `error` (always 500), `retrySucceeds` (fails twice,
  then passes), plus the happy default — and stories opt into a scenario
  with one line, so every server state is a URL a person can open and a
  test a browser runs.
files:
  - apps/demo/src/entities/article/mocks/handlers.ts
  - apps/demo/src/app/integration/Articles.list-request.stories.tsx
  - packages/create-karkas/template/src/shared/mocks/utils.ts
demo: /demo/articles
order: 2
---

The same request boundary serves the demo, the Storybook catalog, and the
browser test suite. MSW intercepts at the network level in all three, so
there is exactly one place where the server can misbehave — and the entity
that owns the endpoint owns its misbehavior scenarios too.

## Named scenarios per entity

Each entity's mock handlers export more than the happy path. From
`entities/article/mocks/handlers.ts`:

- `articleList` — the default resolver: realistic data, realistic latency.
- `articleList.error` — the request always fails with a 500.
- `articleList.loading` — the request never resolves: the pending state is
  on screen for as long as a person wants to look at it.
- `articleList.retrySucceeds()` — fails twice, then passes: retry affordances
  and retry exhaustion get exercised, not imagined.

A story picks a scenario with `msw.use(articleList.error)` in its `beforeEach`
— one line, and the whole user journey runs against that server state: the
error screen renders, the retry button re-requests, the success case lands
after two failures.

## The utilities behind the scenarios

`shared/mocks/utils.ts` provides the building blocks: `to400`/`to422`/`to500`
throwers for shaped API errors (the 422 carries Standard-Schema-style
validation issues), and `withRetrySuccess(resolver, failures)` which wraps any
resolver in a fail-N-times wrapper.

## Why stories, not unit tests

A server state is only real when a user can perceive what the interface does
with it. Modeling scenarios as MSW handlers and asserting through the
rendered UI means the same story that documents the error screen is the test
that fails when the error screen regresses. The alternative — mocking fetch
per test — tests the mock, not the boundary.

## See it in the demo

Open any list or detail screen and watch the Stories: the
`Integration/Articles/List Request` group runs the list against `loading`,
`error`, and `retrySucceeds` in turn — skeleton, error-with-retry, and
eventual recovery are all the same component meeting different servers.
