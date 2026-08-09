# {{project-title}}

A production-ready React application built on the [Karkas](https://github.com/apphane-dev/karkas) stack.

## Stack

- Package Manager: Nub
- Framework: React 19
- State Management & Routing: Reatom
- Styling: Panda CSS with Park UI components
- Internationalization: ParaglideJS
- UI Development & Testing: Storybook with Vitest integration
- Testing: Vitest browser mode with Playwright, written as Storybook stories
- Mocking: MSW (Mock Service Worker)
- Code Quality: oxfmt, oxlint, Fallow, TypeScript 7
- Build Tooling: Vite+ (`vite-plus`)
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
| `shared/`    | Cross-cutting infra: API client, router, kahraman test extensions, components |
| `paraglide/` | Generated ParaglideJS output (do not edit)                                    |

## Setup

Install dependencies (this also generates Panda CSS, compiles ParaglideJS,
generates the MSW worker, and installs `hk` Git hooks):

```bash
nub install
```

## Development

Start the Vite dev server:

```bash
mise run dev
```

Start Storybook:

```bash
mise run storybook
```

## Validation

Run the full local quality pipeline (format, lint, typecheck, tests with
coverage, architecture, Fallow, build, tree-shaking):

```bash
mise run validate
```

For fast feedback on staged files, prefer `hk check` / `hk fix`.
