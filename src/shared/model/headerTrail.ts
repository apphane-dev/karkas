import type { AtomLike, Ext } from '@reatom/core'
import type { ComponentType } from 'react'

import { addChangeHook, atom, withConnectHook } from '@reatom/core'
import { createElement } from 'react'

export type HeaderTrailDescriptor = {
	label: () => string
	href?: string
	isLoading?: () => boolean
	backLabel?: () => string
}

export const headerTrailAtom = atom<ReadonlyMap<number, HeaderTrailDescriptor>>(
	new Map<number, HeaderTrailDescriptor>(),
	'headerTrailAtom',
)

export const breadcrumbsOverrideAtom = atom<ComponentType | null>(null, 'breadcrumbsOverrideAtom')
export const mobileHeaderOverrideAtom = atom<ComponentType | null>(null, 'mobileHeaderOverrideAtom')

type MatchAtom = AtomLike<boolean, [], boolean>
type OverrideAtom = typeof breadcrumbsOverrideAtom | typeof mobileHeaderOverrideAtom

function withMatchLifecycle(onMatch: () => () => void): Ext<MatchAtom> {
	return (target) => {
		target.extend(
			withConnectHook(() => {
				let dispose: (() => void) | undefined
				const sync = (isMatch: boolean) => {
					dispose?.()
					dispose = undefined
					if (isMatch) {
						dispose = onMatch()
					}
				}

				sync(target())
				const unhook = addChangeHook(target, sync)

				return () => {
					unhook()
					dispose?.()
					dispose = undefined
				}
			}),
		)

		return target
	}
}

function setHeaderTrail(level: number, descriptor: HeaderTrailDescriptor) {
	headerTrailAtom.set((prev) => {
		const next = new Map(prev)
		next.set(level, descriptor)
		for (const key of next.keys()) {
			if (key > level) next.delete(key)
		}
		return next
	})
	return () => {
		headerTrailAtom.set((prev) => {
			if (prev.get(level) !== descriptor) return prev
			const next = new Map(prev)
			next.delete(level)
			for (const key of next.keys()) {
				if (key > level) next.delete(key)
			}
			return next
		})
	}
}

/** @public */
export function withMatchHeaderTrail(
	level: number,
	descriptor: HeaderTrailDescriptor,
): Ext<MatchAtom> {
	return withMatchLifecycle(() => setHeaderTrail(level, descriptor))
}

function setOverride(target: OverrideAtom, Component: ComponentType) {
	const override = () => createElement(Component)
	target.set(() => override)
	return () => {
		target.set((current) => (current === override ? null : current))
	}
}

/** @public */
export function withMatchHeaderBreadcrumbsOverride(Component: ComponentType): Ext<MatchAtom> {
	return withMatchLifecycle(() => setOverride(breadcrumbsOverrideAtom, Component))
}

/** @public */
export function withMatchMobileHeaderOverride(Component: ComponentType): Ext<MatchAtom> {
	return withMatchLifecycle(() => setOverride(mobileHeaderOverrideAtom, Component))
}
