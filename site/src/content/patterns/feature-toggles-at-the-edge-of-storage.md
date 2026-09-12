---
title: Feature toggles at the edge of storage
tag: persistence
problem: >-
  Runtime feature flags rot in one of two ways: the flag survives in storage
  after the code that understands it is gone (an unknown name resurrects
  itself on every load), or the flag's state is read through a different door
  than the UI writes it. Mock handlers and startup code can't read React
  state, so they re-parse localStorage by hand and drift from the panel that
  toggles it.
decision: >-
  One atom owns the toggle list. The project declares its toggle names; the
  atom persists through the late-bound web-storage adapter, and everything
  unknown in storage is coerced away on load by the same `fromSnapshot` the
  atom restores through. Consumers without a render tree, MSW handlers and
  startup code, read the same state through `readPersistedFeatureToggles`,
  and the toggle panel is just another component over the atom: absent
  entirely when a project declares no names.
files:
  - packages/create-karkas/template/src/shared/model/featureToggles.ts
  - packages/create-karkas/template/src/shared/model/persist.ts
  - packages/create-karkas/template/src/widgets/app-shell/ui/FeatureTogglePanel.tsx
  - apps/demo/src/shared/mocks/utils.ts
demo: /demo/articles
order: 3
---

A feature toggle is persisted state with hostile input: the value in storage
was written by an older build of the app, or by a hand editing devtools. The
template's `featureTogglesAtom` treats that as the normal case.

## Coercion at the boundary, once

The atom declares its storage key once and attaches persistence with
`withAppWebStorage`, passing the coercion function as `fromSnapshot`:

```ts
const featureToggleNames = ["show-beta-badge", "slow-mocks"] as const;

featureTogglesAtom.extend(
	withFeatureTogglesStorage({
		key: FEATURE_TOGGLES_STORAGE_KEY,
		fromSnapshot: coerceFeatureToggles,
	}),
);
```

`coerceFeatureToggles` keeps only names in the project's list. Because the
same function runs on every restore, a flag removed from the code
disappears from state on the next load instead of haunting the app. And a
garbage record (`not a record`) loads as "no toggles" rather than throwing
during startup.

## One state, many doors

The atom's `.extend` block attaches `setFeature` / `toggleFeature` actions
and a memoized `isEnabled` computed per name. Nothing about that state
assumes a render tree:

- The toggle panel is a `reatomComponent` over the atom; it maps
  `featureTogglesAtom.names` to switches and disappears when a project
  declares an empty list. The template ships empty, the demo declares two.
- `shared/mocks/utils.ts` calls `readPersistedFeatureToggles()` inside MSW
  handlers to apply the `slow-mocks` latency. No React, no re-parse, same
  state the panel writes.

## Why the adapter is late-bound

`withAppWebStorage` (see the persistence adapter) reads
`globalThis.localStorage` when the factory runs, not when `@reatom/core`
loaded. Model modules build their adapter at import time, so a localStorage
stub installed before the import is honored: tests seed storage, then load
the model, and assert on what the atom restored.

## See it in the demo

1. Run the demo app and open any page. The toggle panel sits in the
   bottom-right corner (`Feature toggles`).
2. Flip **slow-mocks** on, then navigate between articles: list and detail
   requests pick up real-network latency because the MSW handlers consult
   the toggle on every request.
3. Flip **show-beta-badge** on: an orange `beta` badge appears above the
   articles list toolbar.
4. Reload the page. Both toggles are still on. State came from storage,
   through coercion, not from a store that died with the page.
5. In devtools, replace the `karkas-feature-toggles` record with garbage
   (`not a record`) or add an unknown name, then reload: the app starts
   clean with the panel switches off.

The integration stories (`Integration/Feature Toggles`) seed storage the
same way and assert the restored switches and the live badge switch.
