import type { AtomLike, Ext } from '@reatom/core'
import type { ComponentType } from 'react'

import { computed } from '@reatom/core'
import { createElement } from 'react'

export type HeaderTrailDescriptor = {
	label: () => string
	href?: string
	isLoading?: () => boolean
	backLabel?: () => string
}

type MatchAtom = AtomLike<boolean, [], boolean>

type HeaderTrailRegistration = {
	target: MatchAtom
	level: number
	descriptor: HeaderTrailDescriptor
}

type OverrideRegistration = {
	target: MatchAtom
	Component: ComponentType
}

// Registration contract: these plain arrays are populated at module-import
// time. Each `withMatch*` extension is applied to a route `match` atom at that
// route module's top level (e.g. `dashboardRoute.match.extend(withMatchHeaderTrail(...))`),
// so by the time any component reads the derived atoms below, every route has
// already appended its entry.
//
// The derived atoms stay reactive to navigation because they read each entry's
// `target()` match atom, so they recompute whenever the active route changes.
//
// The registry list itself is intentionally NOT an atom: this app uses strict
// Reatom context (`clearStack()` in `src/setup.ts`), so an `atom.set` inside
// these extensions would run without a stack and throw `missing async stack`.
// Keep header-trail wiring at module top level next to the route definition; a
// registration added outside a navigation cycle (e.g. from a lazily-imported
// module that loads without a route change) would not be picked up.
const headerTrailRegistrations: HeaderTrailRegistration[] = []
const breadcrumbsOverrideRegistrations: OverrideRegistration[] = []
const mobileHeaderOverrideRegistrations: OverrideRegistration[] = []

export const headerTrailAtom = computed<ReadonlyMap<number, HeaderTrailDescriptor>>(() => {
	const next = new Map<number, HeaderTrailDescriptor>()

	for (const { target, level, descriptor } of headerTrailRegistrations) {
		if (!target()) continue

		next.set(level, descriptor)
		for (const key of next.keys()) {
			if (key > level) next.delete(key)
		}
	}

	return next
}, 'headerTrailAtom')

const createOverrideAtom = (registrations: OverrideRegistration[], name: string) =>
	computed<ComponentType | null>(() => {
		let Component: ComponentType | null = null

		for (const registration of registrations) {
			if (registration.target()) Component = registration.Component
		}

		return Component ? () => createElement(Component) : null
	}, name)

export const breadcrumbsOverrideAtom = createOverrideAtom(
	breadcrumbsOverrideRegistrations,
	'breadcrumbsOverrideAtom',
)
export const mobileHeaderOverrideAtom = createOverrideAtom(
	mobileHeaderOverrideRegistrations,
	'mobileHeaderOverrideAtom',
)

/** @public */
export function withMatchHeaderTrail(
	level: number,
	descriptor: HeaderTrailDescriptor,
): Ext<MatchAtom> {
	return (target) => {
		headerTrailRegistrations.push({ target, level, descriptor })
		return target
	}
}

const withMatchOverride = (
	registrations: OverrideRegistration[],
	Component: ComponentType,
): Ext<MatchAtom> => {
	return (target) => {
		registrations.push({ target, Component })
		return target
	}
}

/** @public */
export function withMatchHeaderBreadcrumbsOverride(Component: ComponentType): Ext<MatchAtom> {
	return withMatchOverride(breadcrumbsOverrideRegistrations, Component)
}

/** @public */
export function withMatchMobileHeaderOverride(Component: ComponentType): Ext<MatchAtom> {
	return withMatchOverride(mobileHeaderOverrideRegistrations, Component)
}
