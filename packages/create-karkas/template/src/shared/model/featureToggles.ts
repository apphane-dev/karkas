import { action, atom, computed } from '@reatom/core'

import { readPersistRecord, withAppWebStorage } from './persist'

// fallow-ignore-next-line unused-export
export const FEATURE_TOGGLES_STORAGE_KEY = 'karkas-feature-toggles'

const withFeatureTogglesStorage = withAppWebStorage('featureToggles')

// Project-local: declare this project's toggle names here. The toggle panel
// appears once the list is non-empty, and anything in storage that is not in
// the list is coerced away on load.
const featureToggleNames = [] as const
export type FeatureToggle = (typeof featureToggleNames)[number]

const featureToggleSet = new Set<string>(featureToggleNames)

function isFeatureToggle(value: unknown): value is FeatureToggle {
	return typeof value === 'string' && featureToggleSet.has(value)
}

function coerceFeatureToggles(value: unknown): Array<FeatureToggle> {
	return Array.isArray(value) ? value.filter(isFeatureToggle) : []
}

// fallow-ignore-next-line unused-export
export function readPersistedFeatureToggles(): Array<FeatureToggle> {
	if (typeof localStorage === 'undefined') return []
	return coerceFeatureToggles(readPersistRecord<unknown>(FEATURE_TOGGLES_STORAGE_KEY))
}

const featureToggleEnabledAtoms = new Map<FeatureToggle, ReturnType<typeof computed<boolean>>>()

export const featureTogglesAtom = atom<Array<FeatureToggle>>([], 'featureToggles').extend(
	withFeatureTogglesStorage({
		key: FEATURE_TOGGLES_STORAGE_KEY,
		fromSnapshot: coerceFeatureToggles,
	}),
	(target) => ({
		names: featureToggleNames,
		isEnabled: (feature: FeatureToggle) => {
			let enabledAtom = featureToggleEnabledAtoms.get(feature)
			if (!enabledAtom) {
				enabledAtom = computed(
					() => target().includes(feature),
					`featureToggles.${feature}.isEnabled`,
				)
				featureToggleEnabledAtoms.set(feature, enabledAtom)
			}
			return enabledAtom
		},
		setFeature: action((feature: FeatureToggle, enabled: boolean) => {
			target.set((current) => {
				const hasFeature = current.includes(feature)
				if (enabled === hasFeature) return current
				return enabled ? [...current, feature] : current.filter((item) => item !== feature)
			})
		}, 'featureToggles.setFeature'),
		toggleFeature: action((feature: FeatureToggle) => {
			target.set((current) => {
				return current.includes(feature)
					? current.filter((item) => item !== feature)
					: [...current, feature]
			})
		}, 'featureToggles.toggleFeature'),
	}),
)
