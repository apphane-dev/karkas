# End-to-end tests (CodeceptJS 4 + Playwright)

This package drives the **real app in a real browser**. It complements — does not
replace — the Storybook integration stories described in `../docs/testing.md`,
which cover components/pages in isolation. E2E here proves full user journeys
(login → dashboard → navigation) against the same MSW-mocked API the app ships
with, so no backend is required.

## Why this is a separate npm package

The app is managed by **nub** (a pnpm-flavoured package manager). CodeceptJS 4's
transitive dependency graph (it pulls in the Vercel `ai` SDK, the MCP SDK, the
WebDriver/Puppeteer/Playwright helper ecosystem, etc.) does **not** converge
under nub 0.2.7's peer resolver — `nub install` fails with
`ERR_NUB_PEER_CONTEXT_NOT_CONVERGED`. `npm`, which is lenient about peer cycles,
installs it without complaint.

Keeping the E2E toolchain in its own `package.json` + `node_modules` also keeps
~360 test-only packages out of the app's lockfile and dependency graph. The
directory is deliberately excluded from the app's quality gates (`.eslintignore`,
`.prettierignore`, `.config/fallow.toml`, `.config/hk.pkl`) — it has its own
`tsconfig.json` and CodeceptJS type definitions.

## Layout

| Path                     | Purpose                                                        |
| ------------------------ | ------------------------------------------------------------- |
| `codecept.conf.ts`       | Runner config: Playwright helper, includes, server lifecycle  |
| `support/server.ts`      | `bootstrap`/`teardown`: starts the Vite dev server (MSW on)   |
| `support/steps_file.ts`  | Custom actor steps (`I.loginAsUser()`)                        |
| `pages/*.ts`             | Page objects (login, dashboard + sidebar navigation, articles) |
| `specs/*_test.ts`        | Scenarios                                                     |
| `steps.d.ts`             | Generated TS definitions for editor autocompletion            |

## Running

From the repo root (preferred — integrates with the project task runner):

```bash
mise run e2e:install   # one-time: npm install + Playwright chromium
mise run e2e           # headless, auto-starts the app with MSW
mise run e2e:headed    # visible browser
mise run e2e:debug     # step-by-step debug output
mise run e2e:def       # regenerate steps.d.ts after adding custom steps
```

Or directly inside this folder: `npm run e2e`.

## How the app gets served

`support/server.ts` runs as the CodeceptJS `bootstrap` hook:

- If a dev server is already answering on `E2E_PORT` (default **5199**), it is
  reused — handy for a fast local loop (`mise run dev --port 5199` in another
  terminal, then `mise run e2e` repeatedly).
- Otherwise it spawns `mise run dev --port 5199` with `VITE_ENABLE_MSW=true`,
  waits for the server to answer, and tears it down again in `teardown`.

The Playwright helper points at `http://localhost:5199/`. Vite binds to
`localhost` (IPv6 `::1` on macOS), so the host is `localhost`, not `127.0.0.1`.

## Mirroring Storybook stories

`specs/articles_test.ts` mirrors the happy-path assertions of
`src/app/integration/Articles.list.stories.tsx` (its `Default` and
`Search Articles` stories) as full-browser E2E, with `pages/articles.ts`
paralleling the Storybook page actor `src/pages/articles/testing.ts`.

What each Storybook technique maps to in E2E:

| Storybook technique                    | E2E equivalent                                                        |
| -------------------------------------- | --------------------------------------------------------------------- |
| Viewport globals (mobile)              | ✅ `I.resizeWindow(390, 844)` — see `articles_mobile_test.ts`         |
| 404 / not-found state                  | ✅ navigate to an unknown id (`/articles/missing-42`) — the default handler already 404s |
| Direct-URL entry                       | ✅ `I.amOnPage('/articles/1')`                                        |
| Per-story `msw.handlers` error/loading | ⚠️ needs a runtime MSW-scenario hook exposed on `window` (small app affordance) or full Playwright `mockRoute` with the service worker blocked — not wired up yet |
| Route-fetch-abort probe                | ⚠️ only a behavioural proxy is possible; the exact AbortSignal assertion can't be made in browser E2E because the MSW service worker absorbs the request, so no network request reaches Playwright to observe as `ERR_ABORTED` |

The last two are the genuine gaps. Everything else — including mobile and 404,
which an earlier version of this doc wrongly excluded — is covered. Mirror the
**journeys**, not the per-story mock plumbing.

## Writing tests

Credentials for `I.loginAsUser()` come from the MSW auth mock
(`src/entities/auth/mocks/data.ts`): `alex@example.com` / `password`. Assert on
product copy from `messages/en/*.json`, not invented strings — same rule as the
Storybook tests. Because the mocked API responds after a delay, wait for async
content (`I.waitForText(...)`, `I.waitInUrl(...)`) rather than asserting
immediately.
