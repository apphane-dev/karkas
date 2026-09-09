---
title: Mock state with a reset contract
tag: api
problem: >-
  Mock APIs that only read fixtures cannot demonstrate the write path: an
  edit that saves, a message that appears after refetch, a subscription that
  changes the plan. The usual fix — mutable arrays keyed by the request's
  referer so each story gets its own copy — leaks across stories that share
  an origin, grows without bound, and re-implements the same lazy-seed
  boilerplate in every handler file.
decision: >-
  Mutable mock state is a registered store, not a module-level Map: a store
  takes a seed provider (never a value), deep-clones on the way in so the
  fixture is never mutated, and self-registers a reset callback. The
  Storybook preview drains the registry before every story — one
  `resetMockStores()` call is the whole isolation contract. The store is
  deliberately plain JS, not a Reatom atom: MSW handlers run outside any
  Reatom frame, so a reactive read would throw "missing async stack".
files:
  - packages/create-karkas/template/src/shared/mocks/store.ts
  - apps/demo/src/entities/article/mocks/handlers.ts
  - apps/demo/.storybook/preview.tsx
demo: /demo/articles
order: 7
---

## The store, not a Map

`shared/mocks/store.ts` gives every mock collection the same shape:

```ts
const articlesStore = mocksStore<Article>("articles", () => articlesMockData);
```

The seed is a provider, re-invoked on every `reset()` — so mutations made by
a previous story never survive into the next one. Items are deep-cloned on
insert, so a handler that patches an entry cannot corrupt the shared fixture
object. `patch`, `add`, `delete`, `replace` throw or clone loudly; there is no
silent-failure path to discover in a failing story.

Ad-hoc state that is not a collection (the demo's "current plan id" scalar)
does not force a keyed shape — it registers its own callback with
`registerMockReset`, and the same drain resets it.

## Why not referer keying

Keying state by `request.headers.get('referer')` isolates stories only by
accident: every story on the same origin shares a key, the Map grows for the
lifetime of the page, and a story that navigates (changing the referer)
silently loses its own state. The reset contract replaces all of it — the
preview's `beforeEach` runs `resetMockStores()` before any story code, so a
store's lifetime is exactly one story, by construction.

## Why the store is not a Reatom atom

MSW handlers run outside any Reatom frame, and the app uses a strict
`clearStack()` setup: a reactive read from a handler throws
`missing async stack`. The store is plain JS on purpose — reads are
snapshots, writes are immediate, and the reactivity layer stays where it
belongs, in the UI.

## See it in the demo

Edit an article in the `Integration/Articles/Detail` stories: the saved body
persists across refetches within the story because the handler patches the
store, not a fixture — and the next story starts from seed data because the
preview drained the registry. `shared/mocks/store.test.ts` encodes the
contract edge cases: re-evaluated seeds, mutation discard on reset, deep
clone of fixtures, and repeated drains staying harmless.
