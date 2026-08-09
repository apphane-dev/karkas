import { context, noop, urlAtom, withChangeHook } from '@reatom/core'

const originalHref = window.location.href
export const setupStorybookUrl = (initialPath = '', beforeNavigate?: () => void) => {
	const frame = context.start()
	frame.run(() => {
		// Configure urlAtom for Storybook: routing state works internally but
		// the iframe URL stays fixed so Storybook remains happy.
		urlAtom.sync.set(() => noop)
		urlAtom.extend(withChangeHook(() => void window.history.replaceState({}, '', originalHref)))
		// Run pre-navigation setup (e.g. auth) BEFORE urlAtom.go so that
		// route matching and loader evaluation happen only once with the
		// correct state, avoiding concurrent loader abort errors.
		beforeNavigate?.()
		const base = import.meta.env.BASE_URL ?? ''
		urlAtom.go(base + initialPath)
	})

	return frame
}
