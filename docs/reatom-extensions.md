# Reatom Extensions

This doc follows the source-first approach in `docs/README.md`.

## Overview

This guide covers extension points in general, not only `withConnectHook`.

Use extensions to add behavior at the atom/action boundary: validation, persistence, async lifecycle, side effects, URL sync, and feature-specific APIs.

## Read Source First

| File                                                                | Why read it                                                      |
| ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/shared/model/locale.ts`                                        | `withParams` + `withLocalStorage` + `withChangeHook` composition |
| `src/shared/model/theme.ts`                                         | enum coercion and persisted preferences                          |
| `src/pages/items/model/filters.ts`                                  | URL-bound filters via `withSearchParams`                         |
| `src/entities/conversation/model/unreadCount.ts`                    | async read model with `withAsyncData` + `withConnectHook`        |
| `src/pages/timer/model/atoms.ts`                                    | action lifecycle with `withAbort` and change hooks               |
| `src/shared/model/headerTrail.ts`                                   | custom domain extension (`withMatch*`) and cleanup mechanics     |
| `node_modules/@reatom/core/build/src/extensions/withConnectHook.js` | connect/disconnect runtime behavior                              |
| `node_modules/@reatom/core/build/src/extensions/withChangeHook.js`  | state-change hook scheduling semantics                           |

## Rules

- Name every extension-created primitive (`effect`, `computed`, `action`).
- Compose small extensions in a deterministic order (parse/coerce before persistence, persistence before side effects).
- Keep extension public API narrow; expose domain helpers, keep low-level internals private.
- Put mutable runtime state in per-connection/per-run scope, not module-level extension closures.
- Make cleanup idempotent and identity-safe when touching shared/global atoms.
- Do not create reactive subscription to `target` inside `withConnectHook` (avoid `effect(() => target())` there).
- For connect-scoped tracking of target changes, use `addChangeHook(target, cb)` and always call returned `unhook` in cleanup.
- Keep loaders for data fetching; route UI side effects should live in route extension points (for example `route.match.extend(...)`).

## Extension Points

| Need                                        | Primary extension(s)                    | Example                                                                             |
| ------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| Normalize input before write                | `withParams`, custom coercion           | `src/shared/model/locale.ts`, `src/shared/reatom/withCoerce.ts`                     |
| Persist state                               | `withLocalStorage`/`withSessionStorage` | `src/shared/model/topBar.ts`, `src/shared/model/theme.ts`                           |
| React to value changes                      | `withChangeHook`                        | `src/shared/model/locale.ts`, `src/pages/timer/model/atoms.ts`                      |
| React to action calls                       | `withCallHook`                          | Use when behavior depends on action invocations, not atom value                     |
| Resource lifecycle on first/last subscriber | `withConnectHook`/`withDisconnectHook`  | `src/entities/conversation/model/unreadCount.ts`, `src/shared/model/headerTrail.ts` |
| Async state (`pending/data/error/retry`)    | `withAsync`, `withAsyncData`            | `src/entities/conversation/model/unreadCount.ts`                                    |
| Concurrency/abort strategy                  | `withAbort`                             | `src/pages/timer/model/atoms.ts`                                                    |
| URL query synchronization                   | `withSearchParams`                      | `src/pages/items/model/filters.ts`                                                  |
| Custom cross-cutting behavior               | custom `Ext<T>` + helpers               | `src/shared/model/headerTrail.ts`                                                   |

## Workflows

### Choose the right extension point

1. If you need state normalization, start with `withParams` or coercion helper.
2. If you need persistence, add `withLocalStorage`/`withSessionStorage`.
3. If you need reactions to value changes, use `withChangeHook`.
4. If you need reactions to calls/events, use `withCallHook`.
5. If you need subscriber lifecycle resources, use `withConnectHook`.
6. If you need pending/error/data, use `withAsync*`.
7. If you need cancellation policy, add `withAbort`.

### Build a custom extension safely

1. Type the target explicitly (`Ext<...>`).
2. Keep helper internals private; export only domain entry points.
3. Allocate mutable runtime state inside lifecycle callback scope.
4. Start local reactive sync (`effect`) only when needed.
5. Return cleanup that unsubscribes and reverts side effects.
6. Guard shared state cleanup by identity if parallel flows can overlap.

### Connect-scoped side effects (preferred pattern)

1. In `withConnectHook`, create local `dispose` state for this connection.
2. Do one initial sync from current value (`sync(target())`), without creating reactive subscription.
3. Add dynamic change hook with `addChangeHook(target, sync)`.
4. In cleanup, call `unhook()` and then current `dispose`.
5. Do not keep cross-context mutable `dispose` in outer extension closure.

### Validate extension behavior

1. Verify extension order effects (especially parse/persist/side-effect).
2. Verify rapid state transitions and cleanup ordering.
3. Verify behavior under multiple contexts if your project uses `clearStack`/custom contexts.
4. Run `hk check` for validation, or `hk fix` first if formatting/lint fixes are expected.

## Edge Cases

- `clearStack` in tests can hide production-time context overlap bugs.
- Shared mutable closure state in extension factories can collide across contexts.
- `withChangeHook` alone is not a connect/disconnect lifecycle primitive.
- Forgetting `unhook()` from `addChangeHook` will leak middleware permanently.
- URL/persistence extensions can create cross-tab or history side effects; use intentionally.
- Pure API helpers are not extension points; keep Reatom imports at model, route, and UI binding boundaries.
- For long-lived async resources, isolate scope with `withConnectHook` cleanup and abort-aware flows.
