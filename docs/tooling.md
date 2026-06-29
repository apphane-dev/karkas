# Tooling

This doc follows the source-first approach in `docs/README.md`.

## Overview

The project uses Vite+ for frontend tooling, mise for project workflows, and hk for git-hook/file-scoped quality orchestration.

For anything related to format, lint, test execution, or Vite+ behavior, start with `vite.config.ts`. In this repo, that file is the primary source of truth for those tool settings and is meant to be easy for any agent harness to discover.

## Read Source First

| File                                     | Why read it                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `vite.config.ts`                         | Primary source of truth for Vite+, build, format, lint, and test configuration |
| `.config/mise/conf.d/_config.toml`       | Tool versions, shared environment, mise defaults                               |
| `.config/mise/conf.d/tasks-quality.toml` | Quality task wrappers and full validation pipeline                             |
| `.config/mise/conf.d/tasks-prepare.toml` | Code generation and local setup tasks                                          |
| `.config/hk.pkl`                         | hk hook/check/fix orchestration                                                |
| `package.json`                           | Package-manager scripts and Vite+ dependency aliases                           |

## Responsibility Split

- `vp` owns frontend tool execution: dev server, build, preview, format, lint, check, and test.
- `vite.config.ts` is the first place to inspect when you need formatter rules, lint rules, plugin wiring, or Vite+ testing behavior.
- `mise` owns named project workflows: prepare/codegen, tests, builds, Fallow, architecture checks, and full validation.
- `hk` owns file-scoped quality orchestration for hooks and fast local validation.

Use:

```bash
hk check        # fast quality check for changed files
hk check --all  # fast quality check for the whole repo
hk fix          # auto-fix format/lint issues for changed files
mise run validate # full pipeline: prepare, format/lint fixes, coverage, typecheck, architecture, Fallow, build/tree-shaking
```

## hk Hooks

`.config/hk.pkl` intentionally has two step groups:

- `hygieneSteps`: hk safety builtins for large files, case conflicts, merge conflicts, symlinks, and private keys
- `fastSteps`: `hygieneSteps` plus format (vp_fmt), lint (vp_lint), typecheck
- `checkSteps`: `fastSteps` plus Fallow

Current mapping:

| Command/hook | Steps        | Notes                                                                                       |
| ------------ | ------------ | ------------------------------------------------------------------------------------------- |
| `pre-commit` | `fastSteps`  | Runs with `fix = true`; intended for staged-file auto-fixes and fast feedback.              |
| `hk fix`     | `fastSteps`  | Manual auto-fix entrypoint for changed files.                                               |
| `hk check`   | `checkSteps` | Manual quality check for changed files by default; use `hk check --all` for the whole repo. |
| `pre-push`   | `checkSteps` | Same configured steps as `hk check`; differs only by hook execution context/file selection. |

In this setup, `pre-push` is the hook form of the same static quality gate exposed by `hk check`; the difference is when hk runs it and which files/ref range hk selects.

## Vite+ Alias Notes

Vite+ is currently alpha and aliases/bundles upstream tools. Some package managers and upstream tools compare package names/versions literally and do not understand those aliases.

Known examples:

- `vitest` is aliased to `@voidzero-dev/vite-plus-test` in `package.json`.
- `@voidzero-dev/vite-plus-test@0.1.22` bundles upstream Vitest `4.1.6`, but its package version is still `0.1.22`.
- `@vitest/coverage-v8` must match the bundled upstream Vitest version, so it is pinned to `4.1.6`.
- `vp test run --coverage` may still warn that `vitest@0.1.22` and `@vitest/coverage-v8@4.1.6` are mixed versions. This is an alias/version-reporting false-positive, not a project misconfiguration.
- Similar Vite+ alias limitations are tracked upstream, for example `voidzero-dev/vite-plus#1021` for package-manager peer dependency confusion around Vite aliases.

Do not “fix” the coverage warning by changing `@vitest/coverage-v8` to `0.1.22`; that package follows upstream Vitest versions, not Vite+ package versions.

## hk Builtin Notes

- `.config/hk.pkl` uses `Builtins.vp_fmt` and `Builtins.vp_lint` with `workspace_indicator = null`. The null override is needed because `scripts/steiger/` has its own `package.json` and the builtin default would split by workspace, failing on the sub-workspace with 0 lintable files.
- The typecheck step uses `Builtins.tsc` with a custom `check = "mise run typecheck"` override.

## Fallow Notes

Fallow is wired into `hk check` because it is fast enough for this project. It is intentionally not wired into `pre-commit` or `hk fix`.

The hk Fallow step runs one combined quiet command instead of `mise run lint:fallow`, which runs three separate Fallow commands. This keeps hook output concise and avoids repeating the same workspace-discovery diagnostics three times. Use `mise run lint:fallow` when you want the more verbose per-analysis output.

For complexity/CRAP checks, use `mise run lint:fallow:health` or the full `mise run validate` pipeline. That task first runs coverage and then passes `--coverage .var/coverage` to `fallow health`. Do not interpret raw `fallow health --complexity` output as the project health signal: without coverage, CRAP assumes 0% coverage and can report misleading findings for functions that are already exercised by Storybook tests.

Fallow may emit workspace discovery diagnostics for `tsconfig.json` references such as `tsconfig.app.json` and `tsconfig.node.json`. Those files exist and TypeScript builds correctly. The diagnostic comes from Fallow interpreting TypeScript project-reference paths as workspace directories. Treat it as harmless unless Fallow starts failing.

## Dependency Maintenance

Prefer Vite+ package-manager commands for routine dependency operations:

```bash
vp install
vp add <package>
vp remove <package>
vp update
vp why <package>
```

Use raw `bun` commands only when Vite+ cannot express the needed operation or when debugging the package manager directly.
