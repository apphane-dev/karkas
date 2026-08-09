# Reatom Extensions

This doc follows the source-first approach in `docs/README.md`.

## Overview

This guide covers extension points in general, not only `withConnectHook`.

Use extensions to add behavior at the atom/action boundary: validation, persistence, async lifecycle, side effects, URL sync, and feature-specific APIs.

## Read Source First

| File                                                                                          | Why read it                                                           |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/demo/src/shared/model/locale.ts`                                                                  | `withParams` + `withLocalStorage` + `withChangeHook` composition      |
| `apps/demo/src/shared/model/theme.ts`                                                                   | enum coercion and persisted preferences                               |
| `apps/demo/src/pages/items/model/filters.ts`                                                            | URL-bound filters via `withSearchParams`                              |
| `apps/demo/src/entities/conversation/model/unreadCount.ts`                                              | async read model with `withAsyncData`                                 |
| `apps/demo/src/shared/model/documentTitle.ts`                                                           | connect-scoped side effects with `withConnectHook` + `addChangeHook`  |
| `apps/demo/src/pages/timer/model/model.ts`                                                              | action lifecycle with `withAbort` and change hooks                    |
| `apps/demo/src/shared/model/headerTrail.ts`                                                             | custom domain extension (`withMatch*`) with module-level registration |
| `https://github.com/reatom/reatom/blob/v1001/packages/core/src/extensions/withConnectHook.ts` | connect/disconnect runtime behavior                                   |
| `https://github.com/reatom/reatom/blob/v1001/packages/core/src/extensions/withChangeHook.ts`  | state-change hook scheduling semantics                                |

> The `@reatom/core` package ships only compiled `dist/` output, so the `withConnectHook` / `withChangeHook` sources above point at the upstream `v1001` branch.

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

| Need                                        | Primary extension(s)                    | Example                                                         |
| ------------------------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| Normalize input before write                | `withParams`, custom coercion           | `apps/demo/src/shared/model/locale.ts`                                    |
| Persist state                               | `withLocalStorage`/`withSessionStorage` | `apps/demo/src/shared/model/topBar.ts`, `apps/demo/src/shared/model/theme.ts`       |
| React to value changes                      | `withChangeHook`                        | `apps/demo/src/shared/model/locale.ts`, `apps/demo/src/pages/timer/model/model.ts`  |
| React to action calls                       | `withCallHook`                          | Use when behavior depends on action invocations, not atom value |
| Resource lifecycle on first/last subscriber | `withConnectHook`/`withDisconnectHook`  | `apps/demo/src/shared/model/documentTitle.ts`                             |
| Async state (`pending/data/error/retry`)    | `withAsync`, `withAsyncData`            | `apps/demo/src/entities/conversation/model/unreadCount.ts`                |
| Concurrency/abort strategy                  | `withAbort`                             | `apps/demo/src/pages/timer/model/model.ts`                                |
| URL query synchronization                   | `withSearchParams`                      | `apps/demo/src/pages/items/model/filters.ts`                              |
| Custom cross-cutting behavior               | custom `Ext<T>` + helpers               | `apps/demo/src/shared/model/headerTrail.ts`                               |

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
- Pure API helpers are not extension points; keep Reatom imports at model, route, and UI binding boundaries, except the API transport may read `abortVar.get()` for request cancellation so fetches are abortable by the frame that issues them; explicit signals override the frame signal.
- For long-lived async resources, isolate scope with `withConnectHook` cleanup and abort-aware flows.
