# Tooling

This doc follows the source-first approach in `docs/README.md`.

## Overview

The project uses Vite+ for frontend tooling, mise for project workflows, and hk for git-hook/file-scoped quality orchestration.

## Read Source First

| File                                     | Why read it                                          |
| ---------------------------------------- | ---------------------------------------------------- |
| `vite.config.ts`                         | Vite+, build, format, lint, and test configuration   |
| `.config/mise/conf.d/_config.toml`       | Tool versions, shared environment, mise defaults     |
| `.config/mise/conf.d/tasks-quality.toml` | Quality task wrappers and full validation pipeline   |
| `.config/mise/conf.d/tasks-prepare.toml` | Code generation and local setup tasks                |
| `.config/hk.pkl`                         | hk hook/check/fix orchestration                      |
| `package.json`                           | Package-manager scripts and Vite+ dependency aliases |

## Responsibility Split

- `vp` owns frontend tool execution: dev server, build, preview, format, lint, check, and test.
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
- `fastSteps`: `hygieneSteps` plus format, lint, typecheck
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

The hk docs may mention builtins that exist on hk `main` before they are available in the latest released hk package.

Current local state:

- The hk version used by mise may lag behind hk documentation generated from `main`.
- `Builtins.vp_check`, `Builtins.vp_fmt`, and `Builtins.vp_lint` may be documented before they are exposed by the released hk package used locally.
- `Builtins.ox_lint` and `Builtins.tsc` are available and used where practical.
- `.config/hk.pkl` keeps small local wrappers only where released hk lacks the desired Vite+ builtin or where project-specific commands are needed.

When hk is upgraded, revisit `.config/hk.pkl` and prefer the Vite+ builtins directly if they are available.

## Fallow Notes

Fallow is wired into `hk check` because it is fast enough for this project. It is intentionally not wired into `pre-commit` or `hk fix`.

The hk Fallow step runs one combined quiet command instead of `mise run lint:fallow`, which runs three separate Fallow commands. This keeps hook output concise and avoids repeating the same workspace-discovery diagnostics three times. Use `mise run lint:fallow` when you want the more verbose per-analysis output.

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
