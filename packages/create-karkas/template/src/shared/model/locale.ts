import { atom, computed, withChangeHook, withLocalStorage, withParams } from '@reatom/core'

import { m } from '#paraglide/messages.js'
import { getLocale, isLocale, setLocale, baseLocale, locales } from '#paraglide/runtime.js'

/**
 * Explicit, statically-typed mapping from locale code to its label function.
 * Use this as the source of truth for available locales and their display labels. The
 * `localeAtom` relies on `isLocale` to validate values, so any locale code not present
 * here will be rejected and coerced to `baseLocale` (see `withParams` below).
 *
 * The label functions call `m.*()` directly to keep message references static and
 * enable ParaglideJS tree-shaking.
 */
const localeLabels = {
	en: m.language_en,
	es: m.language_es,
} satisfies Record<string, () => string>

/**
 * Reactive atom holding the active locale, persisted to `localStorage`.
 *
 * - Initialized from the current runtime locale (`getLocale()`).
 * - `withParams` coerces unknown values to `baseLocale`, so calling `.set()`
 *   with an arbitrary string is safe.
 * - `withChangeHook` calls `setLocale` on every change with `{ reload: false }`
 *   to switch locale without a full page reload.
 *
 * @example
 * // Read current locale
 * const locale = localeAtom()
 *
 * // Switch locale
 * localeAtom.set('es')
 *
 * // Iterate configured locales and get their display labels
 * localeAtom.locales.map((l) => localeAtom.label(l)())
 */
export const localeAtom = atom(() => getLocale(), 'locale').extend(
	withParams((value: string | undefined) => (isLocale(value) ? value : baseLocale)),
	withLocalStorage({
		key: 'locale',
		fromSnapshot: (value) => (isLocale(value) ? value : baseLocale),
	}),
	withChangeHook((locale) => void setLocale(locale, { reload: false })),
	(target) => ({
		/** Readonly array of all configured locales (e.g. `["en", "es"]`). */
		locales,
		/**
		 * Returns a locale-aware computed that resolves to the display label for
		 * a given locale code (e.g. `"en"` → `"English"` / `"Inglés"`).
		 * Falls back to the raw locale code if no label is registered.
		 *
		 * When called without an argument, uses the current active locale.
		 *
		 * @example
		 * // In JSX
		 * localeAtom.label(locale)()
		 *
		 * // In a reatomLoc callback (re-evaluated on locale change)
		 * reatomLoc(() => localeAtom.locales.map((l) => ({
		 *   label: localeAtom.label(l)(),
		 *   value: l,
		 * })), 'myFeature.localeItems')
		 */
		label: (localeName: string) =>
			computed(() => {
				target()
				return localeName in localeLabels
					? localeLabels[localeName as keyof typeof localeLabels]()
					: localeName
			}, 'localeLabel'),
		/**
		 * Creates a locale-aware computed value that re-evaluates whenever the
		 * locale changes. Use this for values computed outside of render that
		 * contain translated strings (e.g. `createListCollection` for Ark UI
		 * selects — Ark caches the collection internally, so it must be a new
		 * reference when locale changes).
		 *
		 * Call `m.*()` directly inside the callback — no argument is passed.
		 * This keeps message references static and enables ParaglideJS tree-shaking.
		 *
		 * @param fn - Zero-argument factory returning any value derived from
		 *   translated strings. Called once per locale change.
		 * @param name - Debug name passed to the underlying `computed`.
		 *
		 * @example
		 * const statusCollection = reatomLoc(
		 *   () => createListCollection({ items: [{ label: m.items_filter_all(), value: 'all' }], ... }),
		 *   'feature.statusCollection',
		 * )
		 */
		reatomLoc: <T>(fn: () => T, name: string) =>
			computed(() => {
				target()
				return fn()
			}, name),
	}),
)

/**
 * Shorthand for `localeAtom.reatomLoc`. Creates a locale-aware computed value
 * that re-evaluates whenever the active locale changes.
 *
 * Call `m.*()` directly inside the callback — no argument is passed.
 *
 * @see {@link localeAtom.reatomLoc} for full documentation and examples.
 */
export const reatomLoc = localeAtom.reatomLoc
