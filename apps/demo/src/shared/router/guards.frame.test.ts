import { clearStack, context, noop } from '@reatom/core'
import { expect, test } from 'vite-plus/test'

import { routeGuardConfig, wireRouteGuards } from './guards'

// App.tsx wires the guards at module scope, where the strict setup (`clearStack`
// in setup.ts) leaves no ambient frame. This file runs in isolation because
// `clearStack` empties the process-wide frame stack: nothing after it in the
// same file could use the default global context anymore.
test('guard wiring needs the app frame under the strict setup', () => {
	const config = {
		isAuthenticated: () => false,
		onUnauthenticated: noop,
		onAuthenticatedExclusive: noop,
		orgState: () => ({ hasOrgs: true }),
		currentOrgId: () => null,
		onOrgless: noop,
		onOrgsReady: noop,
	}

	clearStack()
	expect(() => wireRouteGuards(config)).toThrow(/missing async stack/)

	// The repair is the setup.ts idiom: run inside the app's root frame.
	context.start(() => {
		wireRouteGuards(config)
		expect(routeGuardConfig().isAuthenticated).toBe(config.isAuthenticated)
	})
})
