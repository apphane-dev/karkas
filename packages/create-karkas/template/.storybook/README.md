# Storybook interaction testing

Stories in this project are executable **user journeys**. Each story fixes a
reproducible application state (route, auth, mocked server responses); its tests
document what a user can perceive and do in that state. Prefer a few clear
scenarios over one test that branches through unrelated states.

The style follows [kahraman](https://github.com/apphane-dev/kahraman) — an
accessibility-first, CodeceptJS-style actor over Storybook portable stories.
This file is the local contract; kahraman is the upstream rationale.

## Where things live

| Kind                               | Location                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| Integration stories                | `src/app/integration/*.stories.tsx`                                                     |
| Page actors (domain vocabulary)    | `src/pages/<page>/testing.ts`                                                           |
| Reusable actor extensions          | `src/shared/test/pageActor.ts`                                                          |
| Actor factory + locator re-exports | `src/shared/test/index.ts`                                                              |
| Low-level test mechanics           | `src/shared/test/routeFetchAbortProbe.ts`, `abortErrorGuard.ts`, `setupStorybookUrl.ts` |
| Per-entity MSW handlers            | `src/entities/<entity>/mocks/handlers.ts`                                               |
| Global handler aggregate           | `src/app/mocks/handlers.ts`                                                             |
| Mock error/timing helpers          | `src/shared/mocks/utils.ts` (`to500`, `neverResolve`, `withRetrySuccess`, `Error404`)   |
| Viewport map                       | `.storybook/viewports.ts`                                                               |
| Preview wiring                     | `.storybook/preview.tsx`                                                                |

The boundary: **page actors and `pageActor.ts` hold reusable page mechanics and
expectations named in domain language** (`seeConnectionList`, `openEdit`,
`seeError`). **Domain journey steps, expected copy, and business outcomes stay in
the story.** Do not push a whole flow into an opaque helper like
`playCheckoutFlow()`.

## Story format

Storybook preview-factory format with `experimentalTestSyntax` (see
`.storybook/main.ts`). The actor is initialized in `loaders`:

```tsx
import preview from '#.storybook/preview'
import { App } from '#app/App'
import { connectionList } from '#entities/connection/mocks/handlers'
import { connectionsActor as I } from '#pages/connections/testing'
import { role, text } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Connections/List Request',
	component: App,
	parameters: { layout: 'fullscreen', initialPath: 'connections' },
	loaders: [(ctx) => I.init(ctx)],
})
export default meta

export const HandlesLoadServerError = meta.story({
	name: 'Connections Load Server Error',
	play: () => I.waitExit(role('status')),
	parameters: { msw: { handlers: { connectionList: connectionList.error } } },
})

HandlesLoadServerError.test('shows error state when the request fails', async () => {
	await I.seeError()
	await I.see(text("We couldn't load the connection list. Try again in a moment."))
})
```

`I.init(ctx)` in `loaders` is **required before any actor call** — it binds the
canvas, `userEvent`, and a fresh step trace. Register tests with
`Story.test(name, fn)`.

Story-level parameters this project understands:

- `initialPath` — path the router boots at (`setupStorybookUrl`).
- `authenticated` — defaults to `true`; set `false` to boot signed out.
- `msw.handlers` — override individual handler keys (see below).

## Address the UI as a user would

Use `role`, `heading`, `button`, `link`, `text` (from `#shared/test`) with
accessible names — never CSS selectors, test IDs, or DOM traversal when a role
and name express the intent:

```tsx
await I.see(heading('Billing'))
await I.fill(role('textbox', 'Email'), 'ada@example.com')
await I.click(button('Save'))
await I.see(role('alert'))
```

Locator modifiers: `.wait()` (element will appear), `.all()` (collection),
`.maybe()` (nullable optional lookup), `.within(container)` (scope to a
locator/`HTMLElement`), `.within('global')` (escape the current scope — used for
global toasts).

### Scoping

Scope feature assertions so global chrome and toasts don't cause false matches:

- `I.scope(locator, async () => { … })` — run a block scoped to a region.
- `I.within(locator, () => …)` — same, but returns the callback's value.

```tsx
await I.scope(role('main'), async () => {
	await I.seeDetailError()
	await I.retry()
	await I.waitExit(role('status'))
})
```

Toasts live in a global toaster, so assert them with `.within('global')`.

**Accessible-name gaps.** A few controls legitimately lack an accessible name
(e.g. the connection search input has only a placeholder, the detail back-link).
Those page actors drop to `canvas.getByPlaceholderText` / `findByLabelText` and
say why in a comment. Do this only when the role+name path genuinely can't
express the target.

## Stabilize on lifecycle signals, never sleeps

- After an action that starts a request: act, `await I.waitExit(role('status'))`,
  then assert the result.
- A **persistent-loading** story keeps its request pending on purpose — assert
  its loading UI (`seeLoading`) instead of a broad `waitExit(role('status'))`.
- Use `locator.wait()` only when there is no stable exit signal.
- Use `I.retryTo(fn, tries)` for a documented eventual transition with no better
  signal — explain why in a comment (see the stale-toast note in
  `Articles.detail.stories.tsx`).

## Reusable actor vocabulary

Build page vocabulary with `createActor().extend(...)`, narrowly typed to the
base methods it needs. Shared extensions in `pageActor.ts`:

- `withPageError({ title, description })` → `seeError()`
- `withDetailError({ title, description })` → `seeDetailError()`
- `withRetryAndLoading(loadingLabel)` → `retry()`, `seeLoading()`

Per-page actors compose these and add domain methods (`src/pages/*/testing.ts`).

Beyond `see`/`dontSee`/`click`/`fill`, the actor also models: `seeInField`,
`seeNumberOfElements`, `selectOption`, `clear`, `press`, `grabTextFrom(All)`,
`grabValueFrom`, and controlled resilience `tryTo` / `retryTo` / `hopeThat`
(finish a `hopeThat` batch with `I.hopeThat.noErrors()`). Reach for raw
`storybook/test` / browser APIs only for things the actor doesn't model —
focus, history, geometry, screenshots. See `src/shared/test/actor.test.stories.tsx`
for a worked reference of these.

## MSW server states

Each entity's `handlers.ts` exposes a handler group with a fixed shape:

```ts
export const connectionList = {
	default: http.get(url, resolver),
	error: http.get(url, () => to500()),
	retrySucceeds: () => http.get(url, withRetrySuccess(resolver)),
	loading: http.get(url, neverResolve),
}
```

Defaults are registered globally (`preview.tsx` → `parameters.msw.handlers`).
In a story, override **only the affected key** and keep the rest intact:

```tsx
parameters: {
	msw: {
		handlers: {
			connectionList: connectionList.error
		}
	}
}
```

Model distinct meaningful states (success / error / persistent-loading / retry).
Don't add a state variant that doesn't exercise real behavior.

## Responsive variants

Add a mobile variant only when layout or behavior at that size is worth testing —
not to fill a matrix. Widths live in `.storybook/viewports.ts` (Panda default
breakpoints `sm|md|lg|xl|2xl`; `FALLBACK_VIEWPORT` = 1280×720). Update that map
if the Panda breakpoints change.

A mobile story reuses its desktop counterpart's parameters and selects a
viewport global; prefix the test name with `[mobile]`:

```tsx
export const HandlesLoadServerErrorMobile = meta.story({
	name: 'Connections Load Server Error (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: HandlesLoadServerError.input.parameters,
	play: () => I.waitExit(role('status')),
})
```

The Storybook/Vitest integration does not resize the real browser page from
`globals.viewport` alone. `preview.tsx`'s `beforeEach` translates the global into
`page.viewport(...)` via `vite-plus/test/browser`, gated on `__vitest_worker__`
so manual Storybook rendering is untouched.

## Preview wiring worth knowing (`preview.tsx`)

- **Reatom frame** — a decorator provides `reatomContext.Provider`, boots the
  router at `initialPath` via `setupStorybookUrl`, and sets `authSessionAtom`
  from `authenticated`. `useMemo` keys a fresh frame on `[authenticated, initialPath]`.
- **Persisted-state reset** — under `__vitest_worker__` the decorator calls
  `window.localStorage.clear()` so `withLocalStorage` atoms (theme, locale,
  top-bar toggles, auth) don't leak state between stories on the shared origin.
- **Abort guard** (`abortErrorGuard.ts`) — the `beforeEach` teardown drains
  Reatom `AbortError`s and **throws** if any leaked during a story; the decorator
  clears them on unmount. A story that leaks an abort will fail loudly.
- **Diagnostics** — `configureDiagnostics(parameters['kahraman'])` runs in the
  existing `beforeEach`, so kahraman's tamed element-not-found output is active
  for every story **and** per-story `parameters.kahraman` overrides
  (`captureRoleListing`, `maxLength`, a custom `getElementError`) take effect.
  Don't reintroduce a module-top `configureDiagnostics()` call — it would ignore
  those overrides.

## Scripts

Run via `mise run <task>` (or the matching `npm run <task>`, which proxies to
mise):

| Task                     | Purpose                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| `mise run storybook`     | Storybook dev server                                                                     |
| `mise run test`          | Interaction tests, watch mode                                                            |
| `mise run test:run`      | Run once. Focus a file: `mise run test:run -- src/app/integration/Chat.list.stories.tsx` |
| `mise run test:coverage` | Coverage run                                                                             |
| `mise run typecheck`     | `tsc -b`                                                                                 |
| `mise run validate`      | format + lint + typecheck + test (the default full gate)                                 |

No story tags (`@smoke`/`@visual`) are in use; there is no visual-regression
runner configured.

## Review checklist

- Story initializes the actor in `loaders` and uses the preview-factory format.
- Locators use roles + accessible names; feature assertions are scoped; toasts
  use `.within('global')`.
- Async assertions wait on lifecycle (`waitExit` / `.wait()` / `retryTo`), never
  sleeps; persistent-loading stories assert loading UI.
- MSW overrides touch a single handler key; defaults stay intact.
- Shared actor helpers stay generic; domain steps and copy stay in the story.
- Test names state the user-visible outcome; comments explain non-obvious
  synchronization or regressions.
- Responsive/other optional variants exist only where they exercise real
  behavior.
- If you change any convention above, update this file in the same change.
