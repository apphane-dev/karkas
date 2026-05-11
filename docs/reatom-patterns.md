# Reatom Patterns

This doc follows the source-first approach in `docs/README.md`.

## Overview

Project Reatom code favors direct reads, explicit names, and inline event wiring in JSX.

## Read Source First

| File                                         | Why read it                                                     |
| -------------------------------------------- | --------------------------------------------------------------- |
| `src/pages/calculator/ui/CalculatorPage.tsx` | Clear examples of atom/action naming and inline `wrap` handlers |
| `src/pages/items/model/filters.ts`           | URL-bound filters kept in the page model layer                  |
| `src/pages/items/ui/ItemsPage.tsx`           | Practical `reatomLoc` + UI binding patterns                     |
| `src/pages/settings/model/settingsForm.ts`   | Route-loader factory for page-scoped forms                      |
| `src/pages/settings/ui/SettingsPage.tsx`     | Binding route-scoped form fields to inputs and selects          |
| `src/pages/timer/model/atoms.ts`             | Async action patterns (`sleep`, `withAbort`, change hooks)      |
| `src/shared/model/locale.ts`                 | Extended atom pattern with helpers (`label`, `reatomLoc`)       |

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

### Wiring UI events

1. Use inline `wrap(() => actionCall())` in JSX.
2. Only extract handler helpers when reused in multiple places or needed for readability.

### Reading state in components

1. For display-only values, call the atom inline in JSX.
2. For derived branches used multiple times, compute once locally only when needed for clarity or consistency.

## Edge Cases

- Local snapshots are valid when value consistency across mutations matters in one action.
- Plain API helpers such as `src/shared/api/index.ts` stay framework-agnostic and do not import Reatom helpers; use `wrap` at Reatom event/action/computed boundaries instead.
- If an inline handler becomes hard to read, extract it, but keep naming domain-specific.
- If this doc drifts from source, source wins; update the doc to match current code.
