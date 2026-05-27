import '../src/setup'

import '../src/index.css'

import { reatomContext } from '@reatom/react'
import addonA11y from '@storybook/addon-a11y'
import { definePreview } from '@storybook/react-vite'
import { initialize, mswLoader } from 'msw-storybook-addon'
// oxlint-disable-next-line no-restricted-imports
import { useMemo, type PropsWithChildren } from 'react'

import { handlers } from '#app/mocks/handlers'
import { setAuthenticatedForTest } from '#entities/auth'
import { authMockSession } from '#entities/auth/mocks/data'
import { css } from '#styled-system/css'

import { setupStorybookUrl } from './setupStorybookUrl'
import { FALLBACK_VIEWPORT, getViewportSize } from './viewports'

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
		const nextFrame = setupStorybookUrl(initialPath)
		nextFrame.run(() => setAuthenticatedForTest(authenticated ? authMockSession : null))
		return nextFrame
	}, [authenticated, initialPath])
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
		if (!import.meta.env['VITEST']) return
		const { page } = await import('vite-plus/test/browser')
		const viewportGlobal = globals['viewport'] as { value?: string } | string | undefined
		const viewportName = typeof viewportGlobal === 'string' ? viewportGlobal : viewportGlobal?.value
		const viewport = (viewportName ? getViewportSize(viewportName) : null) ?? FALLBACK_VIEWPORT
		await page.viewport(viewport.width, viewport.height)
	},
})

export default preview
