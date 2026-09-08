import { context, noop, urlAtom } from '@reatom/core'
import { afterEach, expect, test } from 'vite-plus/test'

import {
	protectedRoute,
	publicExclusiveRoute,
	routeGuardConfig,
	wireRouteGuards,
} from './guards'

const resetRuntime = () => {
	context.reset()
	urlAtom.routes = {}
	urlAtom.sync.set(() => noop)
	urlAtom.set(new URL('https://example.test/'))
}

// Fresh child routes per test: urlAtom.routes is cleared by resetRuntime, and
// creating a child re-registers its ancestor chain.
const makeRoutes = () => ({
	protectedPage: protectedRoute.reatomRoute({ path: 'guard-protected' }, 'guardProtectedPage'),
	exclusivePage: publicExclusiveRoute.reatomRoute({ path: 'guard-exclusive' }, 'guardExclusivePage'),
})

afterEach(() => {
	resetRuntime()
})

test('an unwired guard callback fails loud instead of swallowing navigation', () => {
	resetRuntime()
	makeRoutes()
	urlAtom.go('/guard-protected')

	expect(() => routeGuardConfig().isAuthenticated()).toThrow(
		/routeGuardConfig.isAuthenticated is not wired/,
	)
})

test('an unauthenticated visit to a guarded page hands off to onUnauthenticated', () => {
	resetRuntime()
	const { protectedPage } = makeRoutes()
	let unauthenticated = 0
	wireRouteGuards({
		isAuthenticated: () => false,
		onUnauthenticated: () => {
			unauthenticated++
		},
		onAuthenticatedExclusive: () => {},
	})
	urlAtom.go('/guard-protected')

	expect(protectedPage()).toBe(null)
	expect(unauthenticated).toBe(1)
})

test('an authenticated visit to a guarded page passes through', () => {
	resetRuntime()
	const { protectedPage } = makeRoutes()
	wireRouteGuards({
		isAuthenticated: () => true,
		onUnauthenticated: () => {},
		onAuthenticatedExclusive: () => {},
	})
	urlAtom.go('/guard-protected')

	expect(protectedPage()).toEqual({})
})

test('an authenticated visit to a public-exclusive page hands off to onAuthenticatedExclusive', () => {
	resetRuntime()
	makeRoutes()
	let exclusive = 0
	wireRouteGuards({
		isAuthenticated: () => true,
		onUnauthenticated: () => {},
		onAuthenticatedExclusive: () => {
			exclusive++
		},
	})
	const { exclusivePage } = makeRoutes()
	urlAtom.go('/guard-exclusive')

	expect(exclusivePage()).toBe(null)
	expect(exclusive).toBe(1)
})

test('an unauthenticated visit to a public-exclusive page passes through', () => {
	resetRuntime()
	makeRoutes()
	wireRouteGuards({
		isAuthenticated: () => false,
		onUnauthenticated: () => {},
		onAuthenticatedExclusive: () => {},
	})
	const { exclusivePage } = makeRoutes()
	urlAtom.go('/guard-exclusive')

	expect(exclusivePage()).toEqual({})
})
