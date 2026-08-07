# karkas

[![npm](https://img.shields.io/npm/v/create-karkas?label=create-karkas)](https://www.npmjs.com/package/create-karkas)

Karkas is an opinionated React application stack and a working reference implementation.
This repository contains the demo application, its documentation site, and the
`create-karkas` initializer.

## Scaffold a project

```bash
npm create karkas@latest my-app
cd my-app
nub install
mise run dev
```

The generated single-app project includes React 19, Reatom state and routing, Feature-Sliced
Design, Panda CSS with Park UI, ParaglideJS localization, MSW, Storybook, Vitest browser
coverage, Kahraman actors, Vite+, Nub, mise, hk, Fallow, and Steiger.

## Repository layout

```text
apps/demo/                 Reference React application
packages/create-karkas/    npm initializer and curated project template
site/                      Astro documentation and landing site
.config/                   Monorepo-wide mise, hk, and Fallow configuration
docs/                      Source-first stack documentation
```

mise exposes child-project tasks with names such as `//apps/demo:build` and
`//packages/create-karkas:test`. Root tasks orchestrate the complete repository.

## Stack

- Framework: React 19
- State and routing: Reatom
- Architecture: Feature-Sliced Design
- Styling: Panda CSS with Park UI
- Internationalization: ParaglideJS
- UI development: Storybook
- Testing: Vitest browser mode with Playwright and Kahraman
- Mocking: MSW
- Build tooling: Vite+
- Package manager: Nub
- Task workflows: mise
- Quality: oxfmt, oxlint, TypeScript, hk, Fallow, and Steiger

## Demo architecture

The reference app follows Feature-Sliced Design under `apps/demo/src/`:

| Layer        | Responsibility                                                                |
| ------------ | ----------------------------------------------------------------------------- |
| `app/`       | Application shell, global composition, integration stories, MSW browser setup |
| `pages/`     | Route-level composition, navigation, loading, and error states                |
| `widgets/`   | Compositional blocks combining entities and shared UI                         |
| `entities/`  | Domain models, API calls, types, mocks, and Reatom atoms                       |
| `shared/`    | API, router, models, Kahraman extensions, mocks, and UI components             |
| `paraglide/` | Generated ParaglideJS output                                                   |

Entities are self-contained with `api/`, `model/`, `mocks/`, and `index.ts` boundaries.
User-observable integration tests live in `apps/demo/src/app/integration/*.stories.tsx`.

## Development

Install the workspace and run its preparation lifecycle:

```bash
nub install
```

Common commands:

| Goal                         | Command                                  |
| ---------------------------- | ---------------------------------------- |
| Run the demo                 | `mise run dev`                           |
| Run Storybook                | `mise run storybook`                     |
| Run the site                 | `mise run dev:site`                      |
| Build every project          | `mise run build`                         |
| Fast quality check           | `hk check`                               |
| Auto-fix format and lint     | `hk fix`                                 |
| Full local validation        | `mise run validate`                      |
| Build the initializer        | `mise run //packages/create-karkas:build` |
| Test the initializer         | `mise run //packages/create-karkas:test`  |

The prepare lifecycle generates Panda's styled system, compiles ParaglideJS messages,
generates and verifies the MSW worker, synchronizes Astro types, and installs hk hooks.

## Live projects

- [Landing site](https://karkas.apphane.dev/)
- [Demo application](https://karkas.apphane.dev/demo/)
- [Storybook](https://karkas.apphane.dev/storybook/)

## Documentation

- [Tooling](docs/tooling.md) — Vite+, mise, Nub, and hk responsibilities
- [Testing](docs/testing.md) — Storybook integration stories, Kahraman, and coverage
- [Localization](docs/localization.md) — ParaglideJS and message catalogs
- [Reatom patterns](docs/reatom-patterns.md) — application state conventions
- [Reatom extensions](docs/reatom-extensions.md) — reusable Reatom helpers

## CI, deployment, and releases

`.github/workflows/test.yml` validates the workspace on pushes and pull requests.
`.github/workflows/deploy.yml` assembles the landing site, demo, and Storybook into one
Cloudflare Pages artifact. `.github/workflows/release.yml` uses Changesets and npm trusted
publishing through GitHub OIDC; it does not require an `NPM_TOKEN`.

npm only allows trusted-publisher configuration after a package exists. Bootstrap the free
`create-karkas` name with one authenticated manual publish of the generated `0.1.0` release,
then configure its trusted publisher for repository `apphane-dev/karkas` and workflow
`.github/workflows/release.yml`. Every subsequent release is tokenless through GitHub OIDC.
