import { context, noop, urlAtom } from '@reatom/core'
import { afterEach, expect, test } from 'vite-plus/test'

import { protectedRoute, publicExclusiveRoute, routeGuardConfig, wireRouteGuards } from './guards'

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
	exclusivePage: publicExclusiveRoute.reatomRoute(
		{ path: 'guard-exclusive' },
		'guardExclusivePage',
	),
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
	const { protectedPage, exclusivePage } = makeRoutes()
	let exclusive = 0
	wireRouteGuards({
		isAuthenticated: () => true,
		onUnauthenticated: () => {},
		onAuthenticatedExclusive: () => {
			exclusive++
		},
	})
	urlAtom.go('/guard-protected')

	expect(protectedPage()).toEqual({})
	// Reading the sibling branch forces its params() to evaluate against this
	// URL: pathless guard branches match every URL, so without an ownership
	// check the exclusive redirect would fire on protected pages too.
	expect(exclusivePage()).toBe(null)
	expect(exclusive).toBe(0)
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
	let unauthenticated = 0
	wireRouteGuards({
		isAuthenticated: () => false,
		onUnauthenticated: () => {
			unauthenticated++
		},
		onAuthenticatedExclusive: () => {},
	})
	const { exclusivePage, protectedPage } = makeRoutes()
	urlAtom.go('/guard-exclusive')

	expect(exclusivePage()).toEqual({})
	// Same ownership rule, mirrored: evaluating the protected branch against a
	// public-exclusive URL must not fire the login hand-off.
	expect(protectedPage()).toBe(null)
	expect(unauthenticated).toBe(0)
})
