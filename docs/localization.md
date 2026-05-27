# Localization

This doc follows the source-first approach in `docs/README.md`.

## Overview

The app uses ParaglideJS with Reatom-driven locale state. Locale switches are reactive and do not reload the page.

## Read Source First

| File                                     | Why read it                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| `src/shared/model/locale.ts`             | Core locale model (`localeAtom`, `localeAtom.label`, `reatomLoc`)            |
| `src/shared/model/index.ts`              | Public exports used across the app                                           |
| `src/app/App.tsx`                        | Root subscription (`localeAtom()`) that triggers rerenders on locale changes |
| `src/widgets/app-shell/ui/AppShell.tsx`  | Top bar language switcher menu usage                                         |
| `src/pages/settings/ui/SettingsPage.tsx` | Language select collection + locale settings UI                              |
| `src/pages/items/ui/ItemsPage.tsx`       | `reatomLoc` + Ark `createListCollection` pattern                             |
| `messages/en/*.json`                     | English source strings split by feature                                      |
| `messages/es/*.json`                     | Spanish source strings split by feature                                      |
| `project.inlang/settings.json`           | Configured locales and message file pattern                                  |
| `src/paraglide/`                         | Generated Paraglide output (do not edit manually)                            |

## Rules

- Add new message keys to the matching feature file for all locales.
- Keep message references static (`m.some_key()`), not dynamic property access.
- For values computed outside render that include translations, use `reatomLoc`.
- For plain render text, call `m.*()` directly in JSX.
- Use `localeAtom.locales` as the locale source for menus and selectors.
- Use `localeAtom.label(locale)()` for locale display names.
- Do not edit generated files under `src/paraglide/`.

## Workflows

### Add message keys

1. Add keys to the matching feature file under `messages/en/` and `messages/es/`.
2. Keep naming consistent (`nav_*`, `settings_*`, `topbar_*`, `<entity>_*`, `language_<locale>`).
3. Run localization generation via project prepare flow if needed.

### Add a new locale

1. Add locale code in `project.inlang/settings.json` (`locales` array).
2. Add `messages/<locale>/*.json` matching the existing feature files.
3. Add `language_<locale>` keys to `messages/<locale>/core.json` (locale labels are centralized there).
4. Register locale label mapping in `src/shared/model/locale.ts` (`localeLabels`).

### Build locale-aware select collections

1. Use `reatomLoc(() => createListCollection(...), '<debugName>')`.
2. Call `m.*()` inside the callback.
3. Pass `collection={collectionAtom()}` to `Select.Root`.

## Edge Cases

- `.set()` on `localeAtom` is safe with unknown strings because `withParams` coerces invalid values to `baseLocale`.
- Use runtime `isLocale` checks only when control flow needs explicit valid/invalid branching.
- Do not move locale side effects out of `src/shared/model/locale.ts`; `withChangeHook` is the canonical wiring.
- Inlang merges the configured message files in `pathPattern` order. Avoid duplicate keys across feature files; later files win.
- Inlang export tooling writes merged messages to the last configured `pathPattern`, so this repo treats the split JSON files as source-owned files edited directly.
