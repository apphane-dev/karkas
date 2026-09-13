import { action, atom, computed, context, noop, urlAtom, wrap } from '@reatom/core'
import { createElement, Fragment, isValidElement } from 'react'
import { afterEach, expect, test } from 'vite-plus/test'

import { createAppPath } from './core'
import {
	orgGuardRoute,
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
	exclusivePage: publicExclusiveRoute.reatomRoute(
		{ path: 'guard-exclusive' },
		'guardExclusivePage',
	),
})

// A local org-id holder instead of the entities/org atom: the guard reads the
// id only through the injected `currentOrgId` thunk, so the tests exercise the
// injection seam shared stays free of entity imports.
const currentOrgIdAtom = atom<string | null>(null, 'test.currentOrgId')

const setOrg = action((orgId: string | null) => {
	currentOrgIdAtom.set(orgId)
}, 'setOrg')

// Guard wiring mirrors App.tsx, with a counting orgState so guard re-runs are
// observable and an optional onOrgsReady hook (the initial-org resolution the
// real wiring performs).
const wireOrgGuards = (
	orgStateCalls: { count: number },
	resolveOrgState: () => { hasOrgs: boolean } | Promise<{ hasOrgs: boolean }> = () => ({
		hasOrgs: true,
	}),
	onOrgsReady: () => void = () => {},
) => {
	wireRouteGuards({
		isAuthenticated: () => true,
		onUnauthenticated: () => {},
		onAuthenticatedExclusive: () => {},
		orgState: () => {
			orgStateCalls.count++
			return resolveOrgState()
		},
		currentOrgId: () => currentOrgIdAtom(),
		onOrgless: () => {},
		onOrgsReady,
	})
}

// The guard's render returns the single active child element, a Fragment when
// the outlet is gated or unmatched. Normalize both to an array for assertions.
const guardOutlet = (): unknown[] => {
	const rendered = orgGuardRoute.render()
	return isValidElement(rendered) && rendered.type !== Fragment ? [rendered] : []
}

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
	expect(() => routeGuardConfig().orgState()).toThrow(/routeGuardConfig.orgState is not wired/)
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
		orgState: () => ({ hasOrgs: true }),
		currentOrgId: () => currentOrgIdAtom(),
		onOrgless: () => {},
		onOrgsReady: () => {},
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
		orgState: () => ({ hasOrgs: true }),
		currentOrgId: () => currentOrgIdAtom(),
		onOrgless: () => {},
		onOrgsReady: () => {},
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
	let exclusive = 0
	wireRouteGuards({
		isAuthenticated: () => true,
		onUnauthenticated: () => {},
		onAuthenticatedExclusive: () => {
			exclusive++
		},
		orgState: () => ({ hasOrgs: true }),
		currentOrgId: () => currentOrgIdAtom(),
		onOrgless: () => {},
		onOrgsReady: () => {},
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
		orgState: () => ({ hasOrgs: true }),
		currentOrgId: () => currentOrgIdAtom(),
		onOrgless: () => {},
		onOrgsReady: () => {},
	})
	const { exclusivePage, protectedPage } = makeRoutes()
	urlAtom.go('/guard-exclusive')

	expect(exclusivePage()).toEqual({})
	// Same ownership rule, mirrored: evaluating the protected branch against a
	// public-exclusive URL must not fire the login hand-off.
	expect(protectedPage()).toBe(null)
	expect(unauthenticated).toBe(0)
})

// Contract: orgGuardRoute.loader depends on the resolved org id, so a loader
// that awaits the guard (the mandatory pattern for every org-bound page)
// refetches when the organization switches — the single control point that
// keeps the guarded route tree free of the previous org's data.
test('a loader awaiting the org guard refetches when the organization switches', async () => {
	resetRuntime()
	makeRoutes()

	const orgStateCalls = { count: 0 }
	wireOrgGuards(orgStateCalls)

	const childLoader = computed(async () => {
		try {
			return await wrap(orgGuardRoute.loader())
		} catch (error) {
			// Invalidation aborts the superseded run — the core loader swallows
			// these the same way (promise.catch(noop)); mirror that here so an
			// expected switch abort is not an unhandled rejection.
			if ((error as Error)?.name === 'AbortError') return null
			throw error
		}
	}, 'test.childLoader')
	const unsubscribe = childLoader.subscribe(() => {})
	await expect.poll(() => orgStateCalls.count).toBe(1)

	setOrg('org-a')
	await expect.poll(() => orgStateCalls.count).toBe(2)

	setOrg('org-b')
	await expect.poll(() => orgStateCalls.count).toBe(3)

	// Re-selecting the same org keeps the guard settled.
	setOrg('org-b')
	await new Promise((resolve) => setTimeout(resolve, 10))
	expect(orgStateCalls.count).toBe(3)

	unsubscribe()
})

test('the org guard renders child loading UI before its initial scope resolves', async () => {
	resetRuntime()
	makeRoutes()
	const orgScopedPage = orgGuardRoute.reatomRoute(
		{ path: 'org-scoped', render: () => createElement('div', { key: 'org-scoped-page' }) },
		'orgScopedPage',
	)
	const orgStateCalls = { count: 0 }
	let resolveOrgState: (() => void) | undefined
	const orgState = new Promise<{ hasOrgs: boolean }>((resolve) => {
		resolveOrgState = () => resolve({ hasOrgs: true })
	})
	wireOrgGuards(orgStateCalls, () => orgState, () => setOrg('org-a'))
	urlAtom.set(new URL('https://example.test/org-scoped'))
	setOrg(null)

	const unsubscribe = orgGuardRoute.render.subscribe(() => {})
	await expect.poll(() => orgStateCalls.count).toBe(1)
	expect(orgGuardRoute.loader.data()).toBeUndefined()
	// Pending scope, matching child: the child renders its own loading state.
	expect(guardOutlet()).toHaveLength(1)
	expect(orgScopedPage.path()).toBe('/org-scoped')

	resolveOrgState?.()
	await expect.poll(() => orgGuardRoute.loader.data()?.orgId).toBe('org-a')
	unsubscribe()
})

test('the org guard settles after selecting the initial organization in its loader', async () => {
	resetRuntime()
	makeRoutes()
	orgGuardRoute.reatomRoute(
		{ path: 'org-scoped', render: () => createElement('div', { key: 'org-scoped-page' }) },
		'orgScopedPage',
	)
	const orgStateCalls = { count: 0 }
	wireOrgGuards(orgStateCalls, undefined, () => setOrg('org-a'))
	urlAtom.set(new URL('https://example.test/org-scoped'))
	setOrg(null)

	const unsubscribe = orgGuardRoute.render.subscribe(() => {})
	await expect.poll(() => orgGuardRoute.loader.data()?.orgId).toBe('org-a')
	expect(guardOutlet()).toHaveLength(1)
	expect(orgStateCalls.count).toBe(2)

	unsubscribe()
})

test('the org guard hides a previous organization outlet while the next scope resolves', async () => {
	resetRuntime()
	makeRoutes()
	orgGuardRoute.reatomRoute(
		{ path: 'org-scoped', render: () => createElement('div', { key: 'org-scoped-page' }) },
		'orgScopedPage',
	)
	const orgStateCalls = { count: 0 }
	let resolveOrgB: (() => void) | undefined
	const orgBState = new Promise<{ hasOrgs: boolean }>((resolve) => {
		resolveOrgB = () => resolve({ hasOrgs: true })
	})
	wireOrgGuards(
		orgStateCalls,
		() => (orgStateCalls.count === 2 ? orgBState : { hasOrgs: true }),
	)
	urlAtom.set(new URL('https://example.test/org-scoped'))
	setOrg('org-a')

	const unsubscribe = orgGuardRoute.render.subscribe(() => {})
	await expect.poll(() => orgGuardRoute.loader.data()?.orgId).toBe('org-a')
	expect(guardOutlet()).toHaveLength(1)

	setOrg('org-b')
	await expect.poll(() => orgStateCalls.count).toBe(2)
	// While the next scope resolves, the outlet stays gated and the deep URL
	// is untouched — collapsing earlier would abort the guard's in-flight
	// rerun into a permanently pending loader.
	expect(guardOutlet()).toHaveLength(0)
	expect(urlAtom().pathname).toBe('/org-scoped')

	resolveOrgB?.()
	await expect.poll(() => orgGuardRoute.loader.data()?.orgId).toBe('org-b')
	// Settling under org B collapses the deep old-org URL to the app root:
	// no child matches anymore, so the old org's page stays gone.
	await expect.poll(() => urlAtom().pathname).toBe(createAppPath())
	expect(guardOutlet()).toHaveLength(0)

	unsubscribe()
})

test('a deep link keeps its URL on boot, and sign-out never collapses', async () => {
	resetRuntime()
	makeRoutes()
	orgGuardRoute.reatomRoute(
		{ path: 'org-scoped', render: () => createElement('div', { key: 'org-scoped-page' }) },
		'orgScopedPage',
	)
	const orgStateCalls = { count: 0 }
	wireOrgGuards(orgStateCalls)
	// Boot (undefined -> 'org-a') at a deep URL: not a switch, no collapse.
	urlAtom.set(new URL('https://example.test/org-scoped'))
	setOrg('org-a')

	const unsubscribe = orgGuardRoute.render.subscribe(() => {})
	await expect.poll(() => orgGuardRoute.loader.data()?.orgId).toBe('org-a')
	expect(urlAtom().pathname).toBe('/org-scoped')

	// Sign-out shape (id -> null payload): also not a switch.
	setOrg(null)
	await expect.poll(() => orgGuardRoute.loader.data()).toBe(null)
	await new Promise((resolve) => setTimeout(resolve, 10))
	expect(urlAtom().pathname).toBe('/org-scoped')

	unsubscribe()
})
