import { computed, reatomEnum, reatomMediaQuery, withLocalStorage } from '@reatom/core'

const isDarkModeMedia = reatomMediaQuery('(prefers-color-scheme: dark)')

const coerceThemePreference = (value: string | undefined) => {
	if (value === 'system' || value === 'light' || value === 'dark') return value
	return 'system'
}

export const themePreferenceAtom = reatomEnum(
	['system', 'light', 'dark'],
	'themePreference',
).extend(
	(target) =>
		target.extend(withLocalStorage({ key: 'theme', fromSnapshot: coerceThemePreference })),
	(target) => ({
		resolved: computed(() => {
			const pref = target()
			if (pref === 'system') return isDarkModeMedia() ? 'dark' : 'light'
			return pref
		}, 'resolved'),
	}),
)
