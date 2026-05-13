import { addChangeHook, computed, withConnectHook } from '@reatom/core'

import { m } from '#paraglide/messages.js'

import { headerTrailAtom } from './headerTrail'
import { localeAtom } from './locale'

function formatDocumentTitle(pageLabel: string | undefined, appName: string) {
	if (!pageLabel || pageLabel === appName) return appName
	return `${pageLabel} | ${appName}`
}

export const documentTitleAtom = computed(() => {
	localeAtom()
	const appName = m.app_name()
	const entries = [...headerTrailAtom().entries()].sort(([a], [b]) => a - b)
	const last = entries.at(-1)?.[1]
	if (!last) return appName

	// Avoid transient "not found" titles while detail data is loading.
	if (last.isLoading?.()) {
		const parent = entries.at(-2)?.[1]
		return formatDocumentTitle(parent?.label(), appName)
	}

	return formatDocumentTitle(last.label(), appName)
}, 'documentTitleAtom').extend(
	withConnectHook((target) => {
		if (typeof document === 'undefined') return
		document.title = target()
		return addChangeHook(target, (title) => {
			document.title = title
		})
	}),
)
