# Testing

This doc follows the source-first approach in `docs/README.md`.

## Overview

All tests are Storybook integration stories with inline `.test()` assertions. There are no standalone `*.test.ts` or `*.spec.ts` files — the only `.test.` file is `src/shared/test/actor.test.stories.tsx`, which tests the kahraman integration.

The default stabilization strategy is:

- Loaded-state stories: `play: () => I.waitExit(role('status'))`
- Loading-state stories: do not wait for exit; assert loading UI directly
- `.wait()` exists and is still supported, but should be rare and used for edge cases

## Read The Source First

### Where to find tests

Grepping `test|spec|vitest` inside an entity directory will not find its tests — they live elsewhere.

| What you are looking for       | Where to look                                            |
| ------------------------------ | -------------------------------------------------------- |
| Integration tests              | `src/app/integration/*.stories.tsx`                      |
| Current product test coverage  | Integration stories above                                |
| Reusable page actor helpers    | `src/pages/<page>/testing.ts`                            |
| Mock handlers and fixture data | `src/entities/<entity>/mocks/handlers.ts`, `.../data.ts` |
| Actor/helper self-tests        | `src/shared/test/actor.test.stories.tsx`                 |

To find tests for an entity, search for `.test(` in `src/app/integration/` or look for the entity name in story file names.

### Key files

| File                                                  | Why read it                                                                            |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`kahraman`](https://github.com/apphane-dev/kahraman) | Base actor and locator DSL (`I.see`, `role`, `text`, `.wait()`, `.all()`, `.within()`) |
| `src/shared/test/pageActor.ts`                        | Application-specific actor extensions                                                  |
| `src/shared/test/actor.test.stories.tsx`              | Focused examples of scoping and locator behavior                                       |
| `src/app/integration/Articles.stories.tsx`            | Canonical master-detail integration patterns (default, error, loading, detail states)  |
| `src/app/integration/Connections.stories.tsx`         | Advanced master-detail and mobile navigation coverage                                  |
| `src/app/integration/Dashboard.stories.tsx`           | Simple page with success/error/loading variants                                        |
| `src/pages/articles/testing.ts`                       | Page actor style for master-detail pages                                               |
| `src/pages/dashboard/testing.ts`                      | Page actor style for simple pages                                                      |
| `src/entities/item/mocks/handlers.ts`                 | All handler variants including `retrySucceeds` assert pattern                          |
| `src/app/mocks/handlers.ts`                           | Central default MSW handler registry                                                   |
| `src/shared/mocks/utils.ts`                           | Shared mock helpers (`to500`, `neverResolve`, etc.)                                    |

## Story Conventions

### Quality bar

Story tests should validate user-observable behavior, not implementation details or whatever the current markup happens to render.

Prefer assertions that are:

- **Accessible**: query by role, accessible name, heading, link, button, or visible text before falling back to lower-level DOM access.
- **Meaningful**: cover the behavior the story name promises, including important positive and negative expectations.
- **Source-backed**: expected fixture data should come from mocks, messages, or documented UX copy—not arbitrary strings invented to satisfy the current component output.
- **Scoped**: use `I.scope(...)` / `.within(...)` for master-detail pages so list assertions do not accidentally pass against detail content, or vice versa.
- **Stable**: wait for explicit loading/status transitions instead of adding broad sleeps or waiting for unrelated UI.

Avoid tests that only assert a generic element exists when a specific expectation is available. For example, prefer `link(/Storage/).options({ current: 'page' })` over a bare `link().options({ current: 'page' })`.

Test names should describe what the user sees or experiences, not which assertion method is used. A good name reads like a product requirement: `'shows only electronics items after filtering'`. If the name mentions a helper or DOM concept, rephrase it from the user's perspective.

### One story per interaction context

Each story export represents a distinct user-visible state or interaction context. Tests on that story assert behavior meaningful **for that state**.

**Do**: split a monolithic `Default` story when tests exercise different interaction states.

```tsx
// Each story = a distinct interaction context
export const Default = meta.story({ name: 'Default' })
Default.test('renders page heading and sample items', ...)

export const FilteredByCategory = meta.story({ name: 'Filtered by Category' })
FilteredByCategory.test('shows only electronics items', ...)

export const SortedByPrice = meta.story({ name: 'Sorted by Price' })
SortedByPrice.test('sorts ascending by default', ...)
```

**Don't**: pile every test onto `Default` when they test different interaction states.

```tsx
// Bad — filtering, sorting, and empty state all on one story
export const Default = meta.story({ name: 'Default' })
Default.test('filters by category', ...)
Default.test('sorts by price', ...)
Default.test('shows empty state', ...)
```

`Default` should only contain tests for the component mounted with no interaction. The exception is integration stories where `play` handles stabilization and subsequent tests click through to different detail states — those are part of the same user flow.

### Naming

| Variant                | Name pattern                               |
| ---------------------- | ------------------------------------------ |
| Happy path (desktop)   | `Default`                                  |
| Happy path (mobile)    | `Default (Mobile)`                         |
| Error state            | `<Feature> Load Server Error`              |
| Error state (mobile)   | `<Feature> Load Server Error (Mobile)`     |
| Loading state          | `<Feature> Request Loading State`          |
| Loading state (mobile) | `<Feature> Request Loading State (Mobile)` |

Mobile test titles still use `[mobile]` prefix in `.test(...)` names.

### Stabilization rules

1. For loaded-state stories, add `play: () => I.waitExit(role('status'))`.
2. Apply the same rule to async error stories where UI appears after initial request resolution.
3. For stories that intentionally keep loading visible (`*.loading` handlers), do not use `waitExit` for that loading target.
4. For detail requests triggered by user action, click first, then wait for the relevant status to exit, then assert detail content.

### Error-state expectations

List/page load failures and detail load failures are different user states. Test them separately and expect copy that matches the failed operation:

- list request failure: page/list error title and description, plus retry affordance
- detail request failure: detail-specific error title and description, scoped to `role('main')` on master-detail pages
- retry success: use a retry-specific MSW handler that fails first and then succeeds, click `Try again`, and assert the loaded content appears
- retry failure: persistent error handlers should keep the user in the same error state after `Try again`
- 404 detail responses: render a specific not-found state, not a generic server-error state
- persistent loading: loading status remains visible and unrelated terminal states are absent

If a test exposes that the UI copy is misleading, fix the product copy and update messages/mocks accordingly instead of weakening the assertion to match the old behavior.

## Actor and Locator Guidance

The actor is codecept-style and should stay declarative. Extend per-page actors in `src/pages/<page>/testing.ts`.

Key base methods:

- `I.see(locator)` / `I.dontSee(locator)` — assert element presence or absence
- `I.waitExit(locator)` — wait for an element to disappear (stabilization)
- `I.click(locator)` / `I.fill(locator, value)` / `I.selectOption(locator, value)` / `I.clear(locator)` / `I.press(key)` — interactions
- `I.scope(locator, callback)` / `I.within(locator, callback)` — scoped queries (aliases, both restore scope on exit)
- `I.seeInField(locator, value)` / `I.dontSeeInField(locator, value)` — assert input/select value
- `I.seeChecked(locator)` / `I.dontSeeChecked(locator)` — assert checked state for checkboxes/radios/switches
- `I.seeDisabled(locator)` / `I.dontSeeDisabled(locator)` — assert disabled state
- `I.seeAttribute(locator, name, value?)` / `I.dontSeeAttribute(locator, name)` — assert attributes when no user-facing locator/state exists
- `I.seeNumberOfElements(locator, count)` — assert element count (use `.all()` locators)
- `I.grabTextFrom(locator)` / `I.grabTextFromAll(locator)` — extract text content for `expect()` assertions
- `I.tryTo(callback)` — run an assertion and return `true`/`false` instead of throwing
- `I.retryTo(callback, maxTries, pollInterval)` — retry a callback up to `maxTries` times
- `I.hopeThat(callback)` — soft assertion: collects failures without throwing; call `I.hopeThat.noErrors()` at the end to fail the test with all collected errors
- `I.resolveLocator(locator)` — escape hatch for direct DOM access

When to use grab vs see:

- Use `I.see(...)` / `I.dontSee(...)` when you only need to assert presence.
- Use state-specific actor assertions when possible: `I.seeChecked(...)`, `I.dontSeeChecked(...)`, `I.seeDisabled(...)`, `I.dontSeeDisabled(...)`, `I.seeInField(...)`, and `I.dontSeeInField(...)`.
- Use `I.seeAttribute(...)` / `I.dontSeeAttribute(...)` only when the state is meaningful but not exposed through a better accessible query or actor helper.
- Prefer improving accessibility over attribute assertions. If a state can be expressed in the accessible name, role, description, or visible text, expose it there and assert it with `I.see(...)` instead.
- Use `I.grabTextFrom(...)` / `I.grabTextFromAll(...)` when you need the actual text for further `expect()` comparisons (sorting, length, partial matches, computed checks).
- Use `I.seeNumberOfElements(...)` when you need to assert an exact count (e.g., after filtering).
- Use `I.grabValueFrom(...)` when you need the current `.value` of a form element for an `expect()` check. For most form assertions, `I.seeInField(...)` / `I.dontSeeInField(...)` are sufficient.

When to use tryTo vs hopeThat:

- `I.tryTo(...)` for a single conditional check that should not fail the test (e.g., "does this item exist?").
- `I.hopeThat(...)` when you want to collect multiple soft failures and report them all at once. Always pair with `I.hopeThat.noErrors()` at the end of the test.

Prefer grab helpers over raw `I.resolveLocator(...)` when extracting text or values.

### Failure diagnostics

The actor augments failures with CodeceptJS-style diagnostics (borrowed from a
comparison experiment preserved on the `experiment/codecept-comparison` branch):

- On failure, the error message ends with a step trace — every actor call that ran,
  `✔`/`✖`, with locator labels (e.g. `✖ I.see(heading "X")`).
- Element-not-found output is capped by `kahraman/preview` instead of dumping the whole rendered tree.
- For failed role queries, the accessible-roles listing is filtered to the queried
  role, so the near-miss candidate is what you see.
- The code frame is retargeted to the page-actor or story call site, rather than kahraman internals.
- A failure screenshot is written to `__screenshots__/` next to the story file
  (gitignored).
- `VITE_TEST_STEPS=true mise run test:run <file>` logs each actor step live, like
  `codeceptjs run --steps`.

### Page actor guidance

Keep reusable expectations in `src/pages/<page>/testing.ts` when they describe page-level behavior shared by multiple stories. This keeps stories readable and prevents duplicated strings from drifting.

Good candidates for page actors:

- page/list/detail loading checks
- page/list/detail error checks, including descriptions and retry buttons
- canonical happy-path content checks
- common mobile navigation actions such as `goBack()`

Keep story-local helpers only when they are specific to one component story or one-off interaction.

### When to use `.wait()`

Use `.wait()` only for edge cases where `I.waitExit(role('status'))` is not the right tool.

Common valid cases:

- Asserting loading UI appears: `await I.see(role('status', 'Loading ...').wait())`
- Local async transitions without a stable status-exit contract
- Targeted interaction assertions where no stable status-exit contract exists yet (for example, short timer/sidebar countdown checks or other local async UI transitions)

If a loaded-state integration story can be stabilized with `play: () => I.waitExit(role('status'))`, prefer that over locator `.wait()` calls.

## MSW Structure

Each entity exposes handlers in `src/entities/<entity>/mocks/handlers.ts`:

- `.default`: successful response (usually with delay)
- `.error`: failing response
- `.loading`: never resolves

Default handlers are aggregated in `src/app/mocks/handlers.ts` and used by Storybook preview. Story-level overrides replace only specific keys.

### Stateful handler factories

Handlers like `.retrySucceeds` are factory functions (`()`) that close over mutable state (e.g. an error counter). The factory is required so each story gets its own isolated state.

The canonical pattern keeps successful resolvers separate from their URL bindings, then composes retry handlers with `withRetrySuccess(resolver)`. See `src/entities/item/mocks/handlers.ts` for the reference implementation.

Key details about `withRetrySuccess`, `Error500`, and other error classes are in `src/shared/mocks/utils.ts` — error classes extend `Error` but return an `HttpResponse` via `assign`, so throwing them inside an MSW handler produces the corresponding HTTP error response.

### Route fetch abort checks

Every route loader that performs a fetch must have a Storybook/browser regression proving the pending request receives and aborts a `RequestInit.signal` when the route stops matching. This is required for route-based fetches, including nested detail loaders.

Use `.loading` MSW handlers plus the shared fetch-boundary probe in `#shared/test/routeFetchAbortProbe`:

```tsx
const usersFetchAbortProbe = createRouteFetchAbortProbe(USERS_API_PATH, 'users')

export const AbortsPendingUsersRequestOnNavigation = meta.story({
	name: 'Aborts Pending Users Request On Navigation',
	beforeEach: routeFetchAbortLifecycle(usersFetchAbortProbe),
	parameters: {
		msw: { handlers: { users: users.loading } },
	},
})

AbortsPendingUsersRequestOnNavigation.test(
	'aborts the pending users request when navigating away',
	async () => {
		await expectRouteFetchAbortOnNavigation(usersFetchAbortProbe, () => I.click(link('Timer')), {
			assertLoading: () => I.seeLoading(),
		})
	},
)
```

Important details:

- Put probe setup/teardown in story-level `beforeEach`, returning the cleanup callback. Do not use `try/finally` inside the `.test()` body for normal probe cleanup.
- Assert at the app `fetch(..., { signal })` boundary. In the browser Storybook runner, MSW resolver `request.signal` is not a reliable proof that the client-side fetch received the route abort signal.
- Keep the MSW handler pending (`.loading`) so navigation away is the only thing that can abort the request.
- Navigate to a non-fetching route such as `Timer` when possible; this keeps the assertion focused on the request being torn down.
- When adding or changing this check, mutation-test it locally at least once: temporarily remove the loader's `{ signal: abortVar.require().signal }`, confirm the focused story fails, restore the signal, and confirm it passes.

## Responsive Testing

Mobile stories use Storybook viewport globals:

- `globals: { viewport: { value: 'sm', isRotated: false } }`

To reuse desktop configuration in mobile variants, pass `parameters: DesktopStory.input.parameters`.

## Running tests

```bash
hk check                        # default project quality gate
hk fix                          # apply auto-fixes, then validate
mise run test:run <file>        # single story file
mise run test:run               # single run (CI)
mise run test:coverage          # single run + coverage report
mise run test                   # watch mode
```

## Coverage

Coverage uses `@vitest/coverage-v8` through `vp test run --coverage`.

Vite+ currently aliases `vitest` to `@voidzero-dev/vite-plus-test`. Because that package reports its Vite+ package version while bundling upstream Vitest internally, coverage can warn about mixed `vitest@0.1.x` and `@vitest/coverage-v8@4.1.x` versions. Keep `@vitest/coverage-v8` pinned to the bundled upstream Vitest version and treat the warning as a Vite+ alpha aliasing false-positive. See `docs/tooling.md`.

Thresholds:

| Metric     | Threshold |
| ---------- | --------- |
| Lines      | 80%       |
| Functions  | 80%       |
| Branches   | 75%       |
| Statements | 80%       |

Excluded from coverage:

- `*.stories.tsx`
- `*.test.{ts,tsx}`
- `src/shared/styled-system/`
- `src/shared/components/ui/`
- `src/main.tsx`

### Known uncovered branches

Some branches are intentionally left uncovered because they cannot be exercised through the UI or the test infrastructure.

**Defensive code unreachable from the UI:**

- `src/pages/timer/model/model.ts` lines 45–46: the `remaining() <= 0` guard in the running change hook. The UI disables the Start button when the timer reaches zero, so `running.setTrue()` is never called with zero remaining. This is a defensive check against programmatic misuse.
- `src/pages/calculator/ui/CalculatorPage.tsx` line 43: the `default` case in `calculate()`. The function is only called when a prior operator exists (`prev !== null && op`), so the argument is always one of `+`, `-`, `*`, `/`. The default exists for TypeScript exhaustiveness.

**Topbar conditional renders (localStorage + responsive visibility):**

- `src/widgets/app-shell/ui/AppShell.tsx` line 226: the LanguageSwitcher `onValueChange`. The language button is present on desktop, but the current UI does not expose the selected locale as a stable user-facing state in the top bar. Prefer adding accessible state before covering this path.
- `src/widgets/app-shell/ui/sidebar.tsx` line 17: the `SidebarToggleButton` click handler. This mobile-only button uses the same responsive CSS pattern and is not found in the accessibility tree at the `sm` viewport in headless tests.
- `src/pages/settings/ui/SettingsPage.tsx` lines 130, 252: the notifications form dirty save button and the language select `onValueChange`. The save button shares text with the profile form's save button, making it ambiguous to target. The language select callback (`localeAtom.set`) is a one-line delegation already exercised by the settings Theme/Density select tests which use the same `CollectionSelect` + `onValueChange` pattern.

**Shared infrastructure guards (corrupt-storage, environment, and non-JSON defenses):**

- `src/shared/model/locale.ts` lines 40–45: the `isLocale(value) ? value : baseLocale` coercion in `withParams` and `fromSnapshot`. These run only when `localStorage` holds a value that is not a configured locale, so normal UI flows never reach the `baseLocale` fallback. Defensive against corrupted persisted state, like the timer `remaining() <= 0` guard above.
- `src/shared/model/theme.ts` lines 7, 18–20: `reatomMediaQuery('(prefers-color-scheme: dark)')` and the `system` branch of `resolved` that reads it. The resolved value depends on the host `prefers-color-scheme` media query, which is not deterministic in headless Chromium; the `coerceThemePreference` invalid-value fallback is the same corrupt-storage defense as the locale coercion.
- `src/shared/router.ts` line 11: `createAppPath`'s `if (!basePath)` branch. `basePath` is derived from `BASE_URL`, which is truthy in every deployed/test environment (it is `'modern-stack'` for GitHub Pages). The empty-`BASE_URL` path is the localhost/dev case and cannot be reached without reconfiguring the environment.
- `src/shared/api/index.ts` line 5 (and the line 4 `if`) and line 40 (and the line 36 nullish branch): `composeApiUrl`'s empty/root-path early return and `parseResponsePayload`'s `response.text()` fallback. Every caller passes a non-empty path starting with `/`, and every MSW handler returns JSON or a `204`; the text-content and empty-path paths are defenses against malformed responses/inputs.
- `src/pages/usage/ui/UsagePage.tsx` and `src/pages/usage/ui/UsageCard.tsx`: the storage-bar color ternary `percentage >= 90 ? 'red.9' : percentage >= 70 ? 'orange.9' : 'blue.9'`. `percentage` is derived from `UsageData`; the default MSW data currently resolves to `42`, so normal usage stories reach the `blue.9` branch. Although story-specific MSW data could force the other branches, asserting the generated color token would test a presentational implementation detail rather than user-observable accessible state.

## Adding a New Page Test

1. Create typed mock data in `src/entities/<entity>/mocks/data.ts`.
2. Add `default` / `error` / `loading` / `retrySucceeds` handlers in `src/entities/<entity>/mocks/handlers.ts` (see `src/entities/item/mocks/handlers.ts` for reference).
3. Register defaults in `src/app/mocks/handlers.ts`.
4. Create `src/pages/<page>/testing.ts` with page actor methods for reusable content, loading, error, and navigation expectations.
5. Add `src/app/integration/<Page>.stories.tsx` with `Default`, `Default (Mobile)`, error, and loading variants.
6. If the route loader fetches data, add an `Aborts Pending <Feature> Request On Navigation` story with `createRouteFetchAbortProbe`, `routeFetchAbortLifecycle`, and `expectRouteFetchAbortOnNavigation`.
7. Add `play: () => I.waitExit(role('status'))` to loaded-state and async error variants, but not to persistent-loading or abort-probe stories.
8. Review the tests against the quality bar above: assertions should be specific, accessible, scoped, and backed by the intended UX/mocks.

## Adding Coverage for an Entity Model Branch

1. Find or create an error-variant MSW handler in `src/entities/<entity>/mocks/handlers.ts` that triggers the branch (e.g. `logoutError` returning HTTP 500).
2. Add a story to the existing integration file (`src/app/integration/<Entity>.stories.tsx`) with `msw.handlers` overriding the relevant endpoint.
3. Assert the user-visible outcome (e.g. redirect to login despite API failure).
4. If the branch cannot be reached from the UI, document it under "Known uncovered branches" in the Coverage section above.
