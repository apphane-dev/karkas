# Testing approaches: in-house Storybook actor vs. plain CodeceptJS

Status: findings + recommendations. Decision record for whether we keep both test
layers and, if so, in what shape. Source-backed and grounded in real runs (see
[Empirical runs](#empirical-runs)); it does **not** repeat marketing claims from
`docs/testing.md` or `e2e/README.md` — where those overclaim, this doc corrects them.

## TL;DR

- The two layers are **much closer than a "component vs. e2e" framing suggests**.
  Both run in a real Chromium, drive the **real reatom router**, and mock the API
  through the **same real MSW service worker**, against the **dev build**.
- The Storybook layer **near-dominates on capability**: it mounts the whole `App`,
  does everything the e2e layer does at the running-app level, **~3× faster**, with
  watch mode, isolation, type safety, and the fetch-abort probe the e2e layer
  physically cannot observe.
- The e2e layer's genuinely unique value is **thin**: the real app entry/bootstrap
  (`index.html` + `main.tsx` + the app's own SW registration) and real
  address-bar/full-page-reload semantics — plus **markedly better failure
  diagnostics** out of the box.
- Recommendation: keep **Storybook as the primary/inner-loop layer**; keep e2e only
  as a **thin boot smoke** (or drop it). The single change that would materially
  raise e2e's value is pointing its bootstrap at a **production preview build**
  instead of `dev`.

## What each layer actually is (verified, not assumed)

| Dimension            | Storybook (vitest browser)                              | e2e (`e2e/`, CodeceptJS 4 + Playwright)     |
| -------------------- | ------------------------------------------------------- | ------------------------------------------- |
| Browser              | Real Chromium (Playwright provider)                     | Real Chromium (Playwright)                  |
| App under test       | Whole `App` **mounted** in the Storybook iframe         | Real app entry (`index.html` + `main.tsx`)  |
| Router               | **Real** reatom `urlAtom` router                        | **Real** router                             |
| MSW                  | **Real** service worker (`public/mockServiceWorker.js`) | **Same** real service worker                |
| Build                | Dev (vite transform)                                    | Dev (`mise run dev`)                        |
| Address bar / reload | Pinned via `replaceState`; no real full-page reload     | Real URL + real full-page reload            |
| Isolation            | Fresh reatom `context` per story (µs)                   | Shared browser session; login `Before` hook |
| Watch mode           | Yes                                                     | No                                          |

Two earlier assumptions were **wrong** and are corrected here:

- **"Storybook fakes the router."** False. `setupStorybookUrl` starts a fresh reatom
  context (isolation) and pins the physical address bar so the Storybook iframe URL
  stays put, then calls the **real** `urlAtom.go(initialPath)`. Clicks, navigation,
  route matching, and loaders are all real. Only the literal browser URL string is
  decoupled (cosmetic).
- **"Storybook uses in-process MSW, not the real SW."** False. `preview.tsx` calls
  `initialize({ serviceWorker })`, registering the real `mockServiceWorker.js`. App
  fetches go through the actual service worker — the same mechanism as e2e (which is
  why `I.mockRoute` sees zero requests in e2e).

Net: the only structural gaps the e2e layer uniquely covers are the **real
entry/bootstrap** and **real reload/URL** semantics. Both real; both narrow. Neither
layer currently exercises the **production build**.

## Empirical runs

Measured on this machine (2026-07), cold.

| Run                 | Storybook                    | e2e                                       |
| ------------------- | ---------------------------- | ----------------------------------------- |
| Green run           | **14.5s** (23 tests, 1 file) | **46s** (25 scenarios, 6 files)           |
| Test execution only | ~10.5s                       | ~10s of steps (150ms–1.2s each)           |
| Fixed overhead      | none                         | dev-server boot + login `Before` per spec |

The 3× gap is **not** per-assertion speed — individual e2e steps are fast. It is
fixed overhead: e2e boots a dev server and re-runs the real login flow (real
navigation + reload) in every `Before`, while Storybook resets with a fresh reatom
context per story. For the single-file iteration loop, Storybook wins decisively.

### Failure feedback — the decisive DX difference

Same class of failure (expected text absent), injected into one assertion in each.

**e2e — excellent, out of the box:**

```
1) Authentication > rejects invalid credentials:
   expected web application to include "DELIBERATE FAILURE not-real copy"
   + expected - actual
   -Sign in Use your workspace credentials to continue. Email Password Signing in
   +DELIBERATE FAILURE not-real copy

   ◯ Scenario Steps:
   ✖ I.see("...")            at Test.<anonymous> (./specs/login_test.ts:12:4)
   ✔ I.click("Sign in")     at Object.submitCredentials (...)
   ✔ I.fillField("Password", "wrong-password") ...
   ✔ I.amOnPage("/login")   ...
```

Clean actual-vs-expected diff, points at the **call site** (`login_test.ts:12`), and
a reverse step-trace with ✔/✖ showing exactly how far it got.

**Storybook — noisy, and points at the wrong layer:**

```
FAIL ... Articles.list.stories.tsx > Default > shows article descriptions in list items
TestingLibraryElementError:
Unable to find an element with the text: /DELIBERATE FAILURE not-real copy/. ...
 ❯ src/shared/test/loc.ts:233:22
 ❯ invokeTextSingle src/shared/test/loc.ts:141:35
 ❯ ... storybook/dist/instrumenter/index.js ...
```

Two concrete defects:

1. **Full-DOM dump.** testing-library prints the entire rendered tree on a miss
   (~21 `class=`-bearing lines of sidebar SVG before the error itself). On a
   full-`App` mount this is a wall of noise.
2. **Stack lands in the DSL, not the story.** Because assertions route through the
   home-grown actor, the code frame points at `src/shared/test/loc.ts` and the
   storybook instrumenter — never at the `*.stories.tsx` line where the bug lives.
   You get the failing test _name_ (enough to locate) but the stack points away from
   your code. This is the concrete tax of owning ~617 lines of actor + locator DSL.

## Where each wins

- **Storybook wins:** speed, watch mode, per-story isolation, type safety, no server,
  the fetch-abort probe (unobservable in e2e — the SW absorbs the request), a11y
  addon. The better inner-loop tool.
- **e2e wins:** failure diagnostics (diff + step-trace + correct file:line), zero
  test-framework maintenance (idiomatic library use), true black-box driving through
  the app's own boot. The better "what actually happened when it broke" tool.

## Recommendation

1. **Keep Storybook as the primary, full-coverage, inner-loop layer.** It earns it.
2. **Keep e2e thin — a boot smoke only** (≈3–5 scenarios: anon→login→dashboard, one
   direct-URL cold entry, one real-reload persistence check). Do **not** grow it into
   a mirror of story coverage. Its standout justification beyond the boot seam is
   failure-feedback quality, not additional coverage.
3. **Flip condition:** point the e2e bootstrap at `vite build` + `vite preview`
   instead of `mise run dev`. Then it tests the **shipped artifact** (base-path, DCE,
   SW registration in prod) — the one thing Storybook fundamentally cannot — and the
   duplication becomes a genuine cross-artifact check rather than the same thing
   twice.
4. **If we will not maintain even a thin, gated e2e:** drop `e2e/` and delete
   `window.__mockControl` + its Vite define (net simplification of shipping code);
   cover the boot seam with a manual pre-release smoke or a CI preview-deploy check.

Note: the `e2e/` package is currently **excluded from every quality gate** (lint,
format, typecheck-in-CI). Whatever we keep, wire its typecheck into CI so it cannot
rot silently.

## Next steps: borrow CodeceptJS DX into the Storybook actor

The e2e layer's best trait — failure diagnostics — is **portable** to the Storybook
actor. Ranked by value/effort. **Status: #1–#5 shipped** (2026-07); verified by
failure injection — the same broken assertion that produced 591 lines of DOM dump
with a stack pointing at `loc.ts` now produces 59 lines, a role-filtered listing, a
step trace, and the page-actor/story call-site:

```
Unable to find an accessible element with the role "heading" and name "Wiress Headphones"

Elements with role "heading":
  Name "Modern Stack": <h2 …/>
  Name "Wireless Headphones": <h1 …/>
(other roles omitted)

Actor steps (most recent last):
  ✔ I.waitExit(status)
  ✔ I.click(text "Wireless Headphones")
  ✔ I.waitExit(status)
  ✖ I.see(heading "Wiress Headphones")

 ❯ Object.seeItemDetail src/pages/items/testing.ts:27:11
     27|    await I.see(heading(name))
 ❯ seeItemDetail src/app/integration/Items.stories.tsx:50:9
```

Live step logging (#5) is opt-in via `VITE_TEST_STEPS=true`. Failure screenshots
usually write beside the story file, but their Playwright capture intermittently times
out after 5 seconds; Vitest emits a warning and skips that artifact without affecting
the test result.

| #   | Borrow                                    | What it fixes                                  | Effort | Where                                                      |
| --- | ----------------------------------------- | ---------------------------------------------- | ------ | ---------------------------------------------------------- |
| 1   | **Step-trace on failure**                 | Recovers codecept's `Scenario Steps` ✔/✖ trace | Med    | `actor.ts` (wrap base methods) + `loc.ts` (locator labels) |
| 2   | **Trim the testing-library DOM dump**     | Kills the wall-of-noise on every miss          | Low    | `configure({ getElementError })` in a test setup module    |
| 3   | **Retarget error to the story call-site** | Stack points at `*.stories.tsx`, not `loc.ts`  | Med    | `actor.ts` (capture stack in wrapper, rewrite on throw)    |
| 4   | **Screenshot on failure**                 | Artifact-on-failure like codecept              | Low    | `screenshotFailures: true` in `vitest.config.ts`           |
| 5   | **Live step logging (opt-in)**            | Mirrors `codeceptjs run --steps`               | Low    | `actor.ts` (`console.info` behind a debug env)             |

Items 1–3 together close the entire failure-feedback gap that motivates keeping the
e2e layer for diagnostics — which, if delivered, strengthens the case for making e2e
a pure boot/prod-artifact smoke.
</content>
