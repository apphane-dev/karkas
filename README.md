# Karkas

Karkas is an opinionated React 19 starter and a working demo app built on it. Most
templates stop once the app boots. Karkas also ships the conventions for growing the app and
the checks that enforce them. A lint rule bans React's state and effect hooks in favor of
Reatom, Steiger guards the Feature-Sliced Design layers, and the Storybook stories you
browse are the browser test suite. Run `npm create karkas@latest` and you start with those decisions made and checked.
The demo shows each one handling loading, errors, retries, and cancelled requests.

Try the [live demo](https://karkas.apphane.dev/demo/), browse its
[Storybook](https://karkas.apphane.dev/storybook/), or read the
[landing site](https://karkas.apphane.dev/).

- **State lives in Reatom.** Atoms, actions, forms, persistence, async loaders, and routes
  share one reactive model. An oxlint rule rejects `useState`, `useEffect`, `useMemo`,
  `memo`, and seven other React hooks.
- **Stories are the tests.** Vitest runs Storybook stories in Chromium through Playwright.
  The demo has 142 integration stories with 262 tests that find elements by role and
  accessible name.
- **One mock backend.** MSW handlers serve the dev server, Storybook, the tests, and the
  published demo. None of them need a real API.
- **Enforced architecture.** Steiger checks Feature-Sliced Design layer and import
  boundaries. Fallow reports dead code, duplication, and complexity weighted by test
  coverage.
- **Localized from the start.** ParaglideJS compiles English and Spanish catalogs, and a
  build check fails if a canary message the app never imports ends up in the bundle.
- **One gate.** `mise run validate` formats, lints, tests with coverage thresholds,
  typechecks, and runs Steiger and Fallow. `hk check` is the fast changed-file version, and
  hk runs it before every push.

A story from the demo. Storybook renders its error screen, and Vitest runs the same story as
a test in Chromium:

```tsx
export const HandlesArticlesLoadServerError = meta.story({
	beforeEach({ msw }) {
		msw.use(articleList.error) // the articles API answers 500
	},
	play: () => I.waitExit(role('status')),
})

HandlesArticlesLoadServerError.test('keeps error state when retry also fails', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.seeError()
})
```

## Contents

- [Getting started](#getting-started)
- [Stack](#stack)
- [Working on this repository](#working-on-this-repository)
- [Demo architecture](#demo-architecture)
- [Documentation](#documentation)
- [CI, deployment, and releases](#ci-deployment-and-releases)

---

## Getting started

You need [mise](https://mise.jdx.dev/getting-started.html) installed and activated in your
shell, and Node.js 20.12 or newer to run the initializer. mise installs the rest of the
project's toolchain, including Nub.

1. Enable mise experimental features. The generated `mise.toml` uses mise's `[deps]` block,
   which requires them.

   ```bash
   mise settings experimental=true
   ```

2. Create the project. The initializer asks whether to set up a Git repository; pass `--git`
   or `--no-git` to skip the question.

   ```bash
   npm create karkas@latest my-app
   cd my-app
   ```

3. Trust the project's mise config and install its tools: Node, Nub, Vite+, hk, and a few
   helpers.

   ```bash
   mise trust
   mise install
   ```

4. Install dependencies. Nub's prepare step also generates Panda CSS output, compiles
   ParaglideJS messages, and writes the MSW worker. Inside a Git repository it installs hk
   Git hooks too.

   ```bash
   nub install
   ```

5. Start the app at <http://localhost:5173>. The login form comes pre-filled with the mock
   account.

   ```bash
   mise run dev
   ```

Before running tests, install the Chromium build Playwright uses:

```bash
nub exec playwright install chromium
```

Then `mise run storybook` opens Storybook on port 6006, `mise run test` runs the stories as
tests in watch mode, and `mise run validate` runs the full local gate.

The initializer is published on npm as
[`create-karkas`](https://www.npmjs.com/package/create-karkas); see its
[README](packages/create-karkas/README.md) for every option.

---

## Stack

| Concern           | Tool                                               |
| ----------------- | -------------------------------------------------- |
| Framework         | React 19                                           |
| State and routing | Reatom                                             |
| Architecture      | Feature-Sliced Design, checked by Steiger          |
| Styling           | Panda CSS with Park UI                             |
| Localization      | ParaglideJS                                        |
| UI development    | Storybook                                          |
| Testing           | Vitest browser mode with Playwright and Kahraman   |
| Mocking           | MSW                                                |
| Build tooling     | Vite+                                              |
| Package manager   | Nub                                                |
| Task workflows    | mise                                               |
| Quality           | oxfmt, oxlint, TypeScript, hk, and Fallow          |

---

## Working on this repository

This repository holds the demo app, the documentation site, and the `create-karkas`
initializer.

```text
apps/demo/                 Reference React application
packages/create-karkas/    npm initializer and curated project template
site/                      Astro documentation and landing site
.config/                   Monorepo-wide mise, hk, and Fallow configuration
docs/                      Source-first stack documentation
```

Set up a clone. The root mise config also uses `[deps]`, so it needs the same experimental
setting:

```bash
git clone https://github.com/apphane-dev/karkas.git
cd karkas
mise settings experimental=true
mise trust
mise install
nub install
nub exec --cwd apps/demo playwright install chromium
```

`nub install` generates Panda's styled system, compiles ParaglideJS messages, generates and
verifies the MSW worker, synchronizes Astro types, and installs hk hooks.

| Goal                     | Command                                   |
| ------------------------ | ----------------------------------------- |
| Run the demo             | `mise run dev`                            |
| Run Storybook            | `mise run storybook`                      |
| Run the site             | `mise run dev:site`                       |
| Build every project      | `mise run build`                          |
| Fast quality check       | `hk check`                                |
| Auto-fix format and lint | `hk fix`                                  |
| Full local validation    | `mise run validate`                       |
| Build the initializer    | `mise run //packages/create-karkas:build` |
| Test the initializer     | `mise run //packages/create-karkas:test`  |

mise exposes child-project tasks with names such as `//apps/demo:build`. Root tasks
orchestrate the whole repository.

---

## Demo architecture

The demo follows Feature-Sliced Design under `apps/demo/src/`:

| Layer        | Responsibility                                                                 |
| ------------ | ------------------------------------------------------------------------------ |
| `app/`       | Application shell, global composition, integration stories, MSW browser setup |
| `pages/`     | Route-level composition, navigation, loading, and error states                 |
| `widgets/`   | Compositional blocks combining entities and shared UI                          |
| `entities/`  | Domain models, API calls, types, mocks, and Reatom atoms                       |
| `shared/`    | API, router, models, Kahraman extensions, mocks, and UI components             |
| `paraglide/` | Generated ParaglideJS output                                                   |

Each entity keeps its `api/`, `model/`, and `mocks/` behind an `index.ts` public API.
User-observable integration tests live in `apps/demo/src/app/integration/*.stories.tsx`.

---

## Documentation

- [Tooling](docs/tooling.md): Vite+, mise, Nub, and hk responsibilities
- [Testing](docs/testing.md): Storybook integration stories, Kahraman, and coverage
- [Localization](docs/localization.md): ParaglideJS and message catalogs
- [Reatom patterns](docs/reatom-patterns.md): application state conventions
- [Reatom extensions](docs/reatom-extensions.md): reusable Reatom helpers

---

## CI, deployment, and releases

`.github/workflows/test.yml` runs a Fallow audit and `mise run ci` on pushes and pull
requests to `main`. `.github/workflows/deploy.yml` assembles the landing site, demo, and
Storybook into one Cloudflare Pages artifact.

`.github/workflows/release.yml` versions and publishes `create-karkas` with Changesets. npm
trusted publishing authenticates the workflow through GitHub OIDC, so it needs no `NPM_TOKEN`
secret, and every release carries npm provenance.
