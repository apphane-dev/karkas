---
title: Server states modeled at the boundary
tag: api
problem: >-
  When only the happy path gets built, loading and error states ship unseen
  and retry flows get found in production. Testing those states against a
  real backend needs fixture databases. Mocking fetch ad hoc in each test
  means every test rebuilds the same failure.
decision: >-
  Each entity exports named MSW scenarios next to its happy path: `loading`
  never resolves, `error` always answers 500, and `retrySucceeds()` fails
  twice before passing. A story opts into one with a single `msw.use` call,
  so each server state is a story a person can open and a browser test runs.
files:
  - apps/demo/src/entities/article/mocks/handlers.ts
  - apps/demo/src/app/integration/Articles.list-request.stories.tsx
  - packages/create-karkas/template/src/shared/mocks/utils.ts
demo: /demo/articles
order: 2
---

The demo, the Storybook catalog, and the browser test suite share one
request boundary. MSW intercepts at the network level in all three, and the
entity that owns an endpoint also owns its failure scenarios.

## Named scenarios per entity

`entities/article/mocks/handlers.ts` exports `articleList` with four
handlers:

- `articleList.default` returns realistic data after realistic latency.
- `articleList.error` always fails with a 500.
- `articleList.loading` never resolves, so the pending state stays on screen
  as long as anyone wants to inspect it.
- `articleList.retrySucceeds()` fails twice, then passes. It is a function
  because each call needs a fresh failure counter.

A story calls `msw.use(articleList.error)` in its `beforeEach`, and the
whole user journey then runs against that server state. The error screen
renders, the retry button sends a new request, and in the `retrySucceeds`
case the list loads after two failures.

## The helpers behind the scenarios

`shared/mocks/utils.ts` has the building blocks. `to400`, `to404`, `to422`,
and `to500` throw shaped API errors. The 422 carries FastAPI-style
`{ loc, msg }` issues, which the login form maps onto its fields.
`neverResolve` backs the loading scenario, and
`withRetrySuccess(resolver, failures)` fails a resolver a set number of
times before letting it answer.

## Why stories and not unit tests

A server state only matters through what the interface does with it.
Scenarios run as MSW handlers and get asserted through the rendered UI, so
the story that documents the error screen is also the test that fails when
the error screen breaks. Mocking fetch in each unit test would check the
mock instead of the boundary.

## See it in the demo

The scenarios live in Storybook. Open the `Integration/Articles/List Request`
group:

1. "Articles Load Server Error" renders the error screen with a
   retry button.
2. "Articles Load Retry Success" fails twice, then shows the list.
3. "Articles Request Loading State" holds the skeleton
   on screen.

The "See it in the demo" button below opens the articles list against the
default handler.
