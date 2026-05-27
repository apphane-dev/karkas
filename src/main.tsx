import './setup' // import before any other reatom code!

import './index.css'

import { assert } from '@reatom/core'
import { reatomContext } from '@reatom/react'
import { createRoot } from 'react-dom/client'

import { App } from '#app/App.tsx'
import { startBrowserMocking } from '#app/mocks/browser'
import { restoreSession } from '#entities/auth'
import { css } from '#styled-system/css'

import { rootFrame } from './setup'
import { themePreferenceAtom } from './shared/model'

await startBrowserMocking()

const root = document.getElementById('root')
assert(root, 'Root element not found')
root.classList.add(css({ colorPalette: 'indigo' }))

rootFrame.run(() => {
	restoreSession()
	themePreferenceAtom.resolved.subscribe((theme) => {
		document.documentElement.classList.toggle('dark', theme === 'dark')
	})
})

createRoot(root).render(
	<reatomContext.Provider value={rootFrame}>
		<App />
	</reatomContext.Provider>,
)
