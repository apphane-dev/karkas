import '../src/setup'

import '../src/index.css'

import { reatomContext } from '@reatom/react'
import addonA11y from '@storybook/addon-a11y'
import { definePreview } from '@storybook/react-vite'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { configure, prettyDOM } from 'storybook/test'

import { clearAbortErrors, drainAbortErrors, formatAbortErrors } from './abortErrorGuard'
// oxlint-disable-next-line no-restricted-imports
import { useEffect, useMemo, type PropsWithChildren } from 'react'

import { handlers } from '#app/mocks/handlers'
import { authSessionAtom } from '#entities/auth'
import { authMockSession } from '#entities/auth/mocks/data'
import { css } from '#styled-system/css'

import { setupStorybookUrl } from './setupStorybookUrl'
import { FALLBACK_VIEWPORT, getViewportSize } from './viewports'

// Tame testing-library's element-not-found output. The default prints the whole
// rendered tree (and byRole misses embed an accessible-roles listing of EVERY
// role on the page) — on a full-App mount that's hundreds of lines of sidebar
// SVG before the actual error. Keep only the queried role's section: near-misses
// of the right role (e.g. a typo'd heading name) are the useful part. See
// docs/testing.md (Failure diagnostics).
const ELEMENT_ERROR_MAX_LENGTH = 2000
const ROLE_LISTING_MARKER = 'Here are the accessible roles:'

function filterRoleListing(message: string) {
	const roleName = /the role "([^"]+)"/.exec(message)?.[1]
	const markerIndex = message.indexOf(ROLE_LISTING_MARKER)
	if (roleName === undefined || markerIndex === -1) return message
	const head = message.slice(0, markerIndex)
	const sections = message.slice(markerIndex + ROLE_LISTING_MARKER.length).split(/^\s*-{10,}\s*$/m)
	const roleSection = sections.find((section) => section.trimStart().startsWith(`${roleName}:`))
	if (roleSection === undefined) return `${head}(no "${roleName}" elements are rendered)`
	return `${head}Elements with role "${roleName}":\n\n${roleSection.trim()}\n\n(other roles omitted)`
}

configure({
	getElementError: (message, container) => {
		const hasRoleListing = message?.includes(ROLE_LISTING_MARKER) ?? false
		const filtered = message === null ? null : filterRoleListing(message)
		// The role section already shows the relevant context; dump (capped) DOM
		// only for query types without a listing (e.g. byText misses).
		const full = [filtered, hasRoleListing ? null : prettyDOM(container, 1000)]
			.filter(Boolean)
			.join('\n\n')
		const capped =
			full.length > ELEMENT_ERROR_MAX_LENGTH
				? `${full.slice(0, ELEMENT_ERROR_MAX_LENGTH)}\n… (truncated)`
				: full
		const error = new Error(capped)
		error.name = 'TestingLibraryElementError'
		return error
	},
})

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
	beforeEach: async ({ globals }) => {
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
