# Reatom Patterns

This doc follows the source-first approach in `docs/README.md`.

## Overview

Project Reatom code favors direct reads, explicit names, and inline event wiring in JSX.

## Read Source First

| File                                                   | Why read it                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------------- |
| `apps/demo/src/pages/calculator/ui/CalculatorPage.tsx` | Clear examples of atom/action naming and inline `wrap` handlers       |
| `apps/demo/src/pages/items/model/filters.ts`           | URL-bound filters kept in the page model layer                        |
| `apps/demo/src/pages/items/ui/ItemsPage.tsx`           | Practical `reatomLoc` + UI binding patterns                           |
| `apps/demo/src/pages/settings/model/settingsForm.ts`   | Route-loader factory for page-scoped forms                            |
| `apps/demo/src/pages/settings/ui/SettingsPage.tsx`     | Binding route-scoped form fields to inputs and selects                |
| `apps/demo/src/pages/timer/model/atoms.ts`             | Async action patterns (`sleep`, `withAbort`, change hooks)            |
| `apps/demo/src/shared/model/featureToggles.ts`         | Persisted, coerced runtime toggles; actions + `isEnabled` on one atom |
| `apps/demo/src/shared/model/locale.ts`                 | Extended atom pattern with helpers (`label`, `reatomLoc`)             |

## Rules

- Name every Reatom primitive (`atom`, `action`, `computed`, `reatomForm`, `reatomComponent`).
- Avoid intermediate variables for one-off atom reads.
- Read atoms directly in JSX when only displaying the value.
- Inline `wrap(() => ...)` handlers in JSX for Reatom actions and atom writes; do not pre-bind handler variables unless reuse is meaningful.
- Keep route-scoped forms in route loaders or loader factories; shared persisted preferences belong in shared model files.
- Keep cross-cutting atom extensions close to atom definition (`withParams`, `withLocalStorage`, `withChangeHook`).

## Workflows

### Adding a new atom/action pair

1. Add a named atom near related domain logic.
2. Add named actions that mutate atom state.
3. Use direct atom reads inside action bodies unless consistency across multiple reads requires a snapshot.

### Adding route-scoped form state

1. Create a loader factory in the page model directory.
2. Build named `reatomForm` instances and page-specific save actions inside the factory.
3. Return the model from the route loader and pass it to the page component from `render`.
4. Bind inputs/selects in UI; keep persisted app-wide preferences in shared model files.

### Navigating from inside a loader or change hook

1. Never write `urlAtom` from the hooks frame of a fulfillment: superseded child loaders reject with unhandled AbortErrors.
2. Do not navigate from the state-write transaction either — it aborts the guard's own in-flight rerun into a permanently pending loader.
3. Defer into its own action with `queueMicrotask(wrap(navigateAction))`; `wrap` carries the async stack into the microtask.
4. Guard the navigation body with a pathname check so repeated triggers cannot loop.

### Wiring UI events

1. Use inline `wrap(() => actionCall())` in JSX.
2. Only extract handler helpers when reused in multiple places or needed for readability.

### Reading state in components

1. For display-only values, call the atom inline in JSX.
2. For derived branches used multiple times, compute once locally only when needed for clarity or consistency.

### Adding a runtime feature toggle

1. Add the toggle name to `featureToggleNames` in `apps/demo/src/shared/model/featureToggles.ts`.
2. Gate behavior through `featureTogglesAtom.isEnabled(name)()` in components, or `readPersistedFeatureToggles()` outside render trees (mock handlers, startup code).
3. Persisted state coerces through `fromSnapshot` on load; storage written by older builds with unknown names loads as if the toggle were off.

## Edge Cases

- Local snapshots are valid when value consistency across mutations matters in one action.
- Plain API helpers such as `apps/demo/src/shared/api/index.ts` stay framework-agnostic and do not import Reatom helpers; use `wrap` at Reatom event/action/computed boundaries instead.
- If an inline handler becomes hard to read, extract it, but keep naming domain-specific.
- If this doc drifts from source, source wins; update the doc to match current code.
