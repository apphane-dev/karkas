import '../src/setup'

import '../src/index.css'

import { reatomContext } from '@reatom/react'
import addonA11y from '@storybook/addon-a11y'
import { definePreview } from '@storybook/react-vite'
import { configureDiagnostics } from 'kahraman/preview'
import { initialize, mswLoader } from 'msw-storybook-addon'

import { clearAbortErrors, drainAbortErrors, formatAbortErrors } from './abortErrorGuard'
// oxlint-disable-next-line no-restricted-imports
import { useEffect, useMemo, type PropsWithChildren } from 'react'

import { handlers } from '#app/mocks/handlers'
import { authSessionAtom } from '#entities/auth'
import { authMockSession } from '#entities/auth/mocks/data'
import { css } from '#styled-system/css'

import { setupStorybookUrl } from './setupStorybookUrl'
import { FALLBACK_VIEWPORT, getViewportSize } from './viewports'

// Storybook 10.5's test preview replaces `HTMLElement.prototype.focus` with an
// accessor for interaction instrumentation. Zag's focus-visible manager reads
// that property from the prototype, invoking the accessor with an invalid
// receiver and causing `TypeError: Illegal invocation`. Keep the native method
// and restore it before each story until the upstream compatibility issue is resolved.
const nativeHTMLElementFocus = globalThis.HTMLElement
	? Object.getOwnPropertyDescriptor(globalThis.HTMLElement.prototype, 'focus')?.value
	: undefined

initialize({
	onUnhandledRequest: 'bypass',
	quiet: true,
	serviceWorker: {
		url: `${import.meta.env['BASE_URL']}mockServiceWorker.js`,
	},
})

function ReatomDecorator({
	children,
	initialPath = '',
	authenticated = true,
}: PropsWithChildren<{ authenticated?: boolean; initialPath?: string }>) {
	const frame = useMemo(() => {
		// localStorage is shared across stories on the same origin. Atoms backed
		// by withLocalStorage (theme, locale, top-bar toggles, auth) would otherwise
		// inherit state a previous story persisted. Reset to defaults in test runs
		// before the fresh frame reads them.
		if ((globalThis as Record<string, unknown>)['__vitest_worker__']) {
			window.localStorage.clear()
		}
		return setupStorybookUrl(initialPath, () => {
			authSessionAtom.set(authenticated ? authMockSession : null)
		})
	}, [authenticated, initialPath])

	useEffect(() => {
		return () => {
			clearAbortErrors()
			queueMicrotask(clearAbortErrors)
		}
	}, [frame])

	return <reatomContext.Provider value={frame}>{children}</reatomContext.Provider>
}

const preview = definePreview({
	addons: [addonA11y()],
	loaders: [mswLoader],
	decorators: [
		(Story, { parameters }) => (
			<ReatomDecorator
				authenticated={parameters['authenticated']}
				initialPath={parameters['initialPath']}
			>
				<Story />
			</ReatomDecorator>
		),
		(Story) => (
			<div className={css({ colorPalette: 'indigo' })}>
				<Story />
			</div>
		),
	],
	parameters: {
		a11y: { test: 'todo' },
		msw: { handlers },
	},
	// fallow-ignore-next-line complexity
	beforeEach: async ({ globals, parameters }) => {
		// Run before a story mounts, so Zag observes the native focus method.
		if (nativeHTMLElementFocus) {
			Object.defineProperty(HTMLElement.prototype, 'focus', {
				configurable: true,
				value: nativeHTMLElementFocus,
			})
		}
		configureDiagnostics(parameters['kahraman'])
		clearAbortErrors()
		if (!(globalThis as Record<string, unknown>)['__vitest_worker__']) return
		const { page } = await import('vite-plus/test/browser')
		const viewportGlobal = globals['viewport'] as { value?: string } | string | undefined
		const viewportName = typeof viewportGlobal === 'string' ? viewportGlobal : viewportGlobal?.value
		const viewport = (viewportName ? getViewportSize(viewportName) : null) ?? FALLBACK_VIEWPORT
		await page.viewport(viewport.width, viewport.height)
		return () => {
			const errors = drainAbortErrors()
			if (errors.length > 0) {
				throw new Error(
					`Reatom AbortErrors detected during story test:\n${formatAbortErrors(errors)}`,
				)
			}
		}
	},
})

export default preview
