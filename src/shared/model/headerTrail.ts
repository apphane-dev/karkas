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
