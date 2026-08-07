# Tooling

This repository uses Nub for dependency installation, mise for project workflows, Vite+ for
frontend tooling, and hk for fast file-scoped quality checks.

## Source map

| File                                      | Responsibility                                                        |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `mise.toml`                               | Monorepo roots                                                        |
| `.config/mise/conf.d/_config.toml`        | Shared tools, environment, and automatic workspace installation       |
| `.config/mise/conf.d/tasks-*.toml`        | Root orchestration                                                    |
| `apps/demo/mise.toml`                     | Demo prepare, dev, build, test, format, lint, typecheck, and Park tasks |
| `apps/demo/vite.config.ts`                | Demo Vite+, build, format, lint, and test configuration               |
| `packages/create-karkas/mise.toml`        | Initializer build and quality tasks                                   |
| `site/mise.toml`                          | Astro site tasks                                                      |
| `.config/hk.pkl`                          | hk check/fix and Git-hook orchestration                               |
| `.config/fallow.toml`                     | Dead-code, duplication, and complexity scope                          |
| `package.json`                            | Nub workspace and root scripts                                        |
| `nub.lock`                                | Workspace lockfile                                                    |

mise discovers `apps/demo`, `packages/create-karkas`, and `site` as namespaced config roots.
Use names such as `//apps/demo:test:run` when invoking one project directly. Root tasks such
as `build`, `format`, `lint`, `typecheck`, `validate`, and `ci` orchestrate every applicable
project.

## Common commands

```bash
nub install                 # install the workspace and run prepare
nub ci                      # frozen CI-equivalent install
mise run dev                # demo Vite server
mise run storybook          # demo Storybook
mise run dev:site           # Astro site
hk check                    # changed-file quality check
hk check --all              # repository-wide fast quality check
hk fix                      # format/lint fixes
mise run validate           # full local pipeline with fixes
mise run ci                 # full non-mutating CI pipeline
```

## Responsibility split

- **Nub** installs all workspaces from `nub.lock` and runs package lifecycle scripts.
- **mise** owns named workflows, code generation, builds, tests, and cross-project ordering.
- **Vite+** runs Vite, formatting, linting, and Vitest for the projects that declare it.
- **hk** calls mise-backed format, lint, and typecheck steps plus a root Fallow check.
- **Fallow** checks dead code, duplicates, and coverage-aware complexity.
- **Steiger** checks Feature-Sliced Design boundaries in `apps/demo/src` using `apps/demo/scripts/steiger/steiger.config.ts`.

The root `prepare` task calls child preparation with `mise run --no-deps`. This prevents a
nested mise invocation from starting another automatic Nub install while Nub is already
running the workspace lifecycle.

## Vite+ test runtime

`apps/demo/package.json` keeps `vitest`, `@vitest/browser-playwright`, and
`@vitest/coverage-v8` on the upstream Vitest version bundled by Vite+. The matching versions
let Storybook's Vitest addon and browser provider share one peer context while `vp test`
remains the task entry point.

## Fallow and coverage

`hk check` runs one concise combined Fallow command. Use `mise run lint:fallow` for separate
dead-code, duplicate, and health output. The health task generates demo coverage first and
passes `.var/coverage` to Fallow; raw complexity output without coverage assumes uncovered
code and is not the repository health signal.

The root Fallow config includes `apps/demo/scripts/**/*.ts` and package source, while
excluding generated Panda, Paraglide, Park UI, template snapshot, and site files.

## Dependency build scripts

Nub denies dependency install/build scripts unless `package.json#allowBuilds` records a
decision.

- `esbuild`: allowed; Vite and related tooling require its platform binary setup.
- `msw`: allowed; the demo prepare lifecycle generates `apps/demo/public/mockServiceWorker.js`.
- `sharp`: denied; no current workflow requires its native install path.

Review newly requested scripts with `nub ignored-builds` before changing these decisions.
