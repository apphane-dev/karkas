# modern-stack

A modern React application demonstrating an opinionated setup with Nub, React 19, Reatom state management, Panda CSS styling, and Storybook with Vitest integration.

## Stack

- Package Manager: Nub (using Aube's install engine)
- Framework: React 19
- State Management: Reatom
- Styling: Panda CSS (with Park UI components)
- Routing: Reatom routing (`reatomRoute`)
- Internationalization: ParaglideJS
- UI Development: Storybook with Vitest integration
- Testing: Vitest with Playwright, written as Storybook integration stories
- Code Quality: oxfmt (formatter), oxlint (linter), Fallow (dead code / complexity), TypeScript 7 RC
- Mocking: MSW (Mock Service Worker)
- Build Tooling: Vite+ (`vite-plus`), wrapping Vite/Vitest
- Git Hooks & Quality Orchestration: `hk`
- Task Workflows: `mise`

## Architecture

The app follows a Feature-Sliced Design (FSD) layout under `src/`:

| Layer        | Responsibility                                                                |
| ------------ | ----------------------------------------------------------------------------- |
| `app/`       | Application shell, global composition, integration stories, MSW browser setup |
| `pages/`     | Route-level compositions and per-page UI, navigation, loading/error states    |
| `widgets/`   | Compositional blocks combining entities and shared UI (e.g. `AppShell`)       |
| `entities/`  | Domain models: API client calls, types, mocks, and Reatom atoms               |
| `shared/`    | Cross-cutting infra: API client, router, test actor/locator DSL, components   |
| `paraglide/` | Generated ParaglideJS output (do not edit)                                    |

Each `entity` is self-contained with `api/`, `model/`, `mocks/`, and an `index.ts` barrel. Tests live in `src/app/integration/*.stories.tsx` as user-observable Storybook stories — see [docs/testing.md](docs/testing.md).

## Setup

Install dependencies:

```bash
nub install
```

This runs the `prepare` script, which:

- Generates the Panda CSS styled-system
- Compiles ParaglideJS message catalogs
- Generates and verifies the MSW worker
- Installs `hk` Git hooks

## Development

Run the development server:

```bash
nub run dev
```

## Validation loop

| Goal                                                                               | Command             |
| ---------------------------------------------------------------------------------- | ------------------- |
| Fast quality check (changed)                                                       | `hk check`          |
| Fast quality check (all)                                                           | `hk check --all`    |
| Auto-fix format/lint                                                               | `hk fix`            |
| Full pipeline (prepare, tests, coverage, architecture, Fallow, build/tree-shaking) | `mise run validate` |

For routine validation, prefer `hk check` / `hk fix`; use `mise run validate` only for the complete pipeline.

## Live

- [App](https://guria.github.io/modern-stack/)
- [Storybook](https://guria.github.io/modern-stack/storybook/)

## Git Hooks

Quality orchestration is handled by `hk` (configuration in `.config/hk.pkl`), not a generic git-hooks runner.

| Hook         | Steps        | Notes                                                        |
| ------------ | ------------ | ------------------------------------------------------------ |
| `pre-commit` | `fastSteps`  | Runs with auto-fix; format, lint, typecheck on staged files. |
| `pre-push`   | `checkSteps` | Adds the Fallow step; same gate as `hk check`.               |

`hk install --mise` is wired into the `prepare` task, so hooks are installed automatically after `nub install`.

## Documentation

In-depth, source-first documentation lives in [`docs/`](docs/):

- [Tooling](docs/tooling.md) — the Vite+ / `mise` / `hk` responsibility split and known alias notes
- [Testing](docs/testing.md) — the Storybook integration-story approach, actor/locator DSL, and coverage policy
- [Localization](docs/localization.md) — ParaglideJS setup and message catalogs
- [Reatom patterns](docs/reatom-patterns.md) — conventions for Reatom state management
- [Reatom extensions](docs/reatom-extensions.md) — reusable Reatom extension helpers

## CI/CD

The project uses GitHub Actions for continuous integration and deployment.

### Test Workflow

Runs on every push and pull request to `main`:

- Type checking with TypeScript
- Code formatting validation with oxfmt
- Linting with oxlint
- Storybook component tests with Vitest and Playwright
- Coverage report generation and upload
- Coverage summary in GitHub Actions output

Configuration: `.github/workflows/test.yml`

### Deployment Workflow

Automatically deploys to GitHub Pages on push to `main`:

- Builds the React application
- Builds Storybook documentation
- Combines both into a single deployment (app at root, Storybook at `/storybook`)
- Deploys to GitHub Pages with proper permissions and concurrency controls

Configuration: `.github/workflows/deploy.yml`
