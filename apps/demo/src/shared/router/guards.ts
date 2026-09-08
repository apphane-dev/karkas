import { action, atom, urlAtom } from '@reatom/core'
import { createElement, Fragment } from 'react'

import { rootRoute } from './core'

// Route-guard wiring. The guard routes below are intentionally policy-free:
// they encode the *structure* of a guard (an auth-required branch, a
// public-exclusive branch) but defer every concrete decision — what counts as
// authenticated, where each redirect goes — to callbacks set here by `App.tsx`,
// the composition root. This keeps `shared` free of domain knowledge (it never
// names the login page) while still owning the guard skeletons, so pages attach
// to `protectedRoute` / `publicExclusiveRoute` instead of hand-rolling gates.
//
// Each callback is seeded with a fail-loud sentinel: a bootstrap that forgets
// to wire a guard throws the moment that guard resolves, rather than silently
// swallowing the navigation. The guards evaluate while routes match, so the
// wiring must run before the first navigation. The setup is strict
// (`clearStack` in `setup.ts`), so a bare top-level `wireRouteGuards(...)`
// call has no Reatom frame and throws `missing async stack` — App.tsx runs it
// inside `rootFrame.run(...)`, the same way setup connects the logger.
//
// 	wireRouteGuards({
// 		isAuthenticated: () => isAuthenticatedAtom(),
// 		onUnauthenticated: () => loginRoute.go(undefined, true),
// 		onAuthenticatedExclusive: () => dashboardRoute.go(undefined, true),
// 	})

const failLoud = (name: string) => (): void => {
	throw new Error(
		`routeGuardConfig.${name} is not wired. Set it in App.tsx before routing resolves.`,
	)
}

export const routeGuardConfig = atom(
	{
		// Read on every guard evaluation — a thunk, not a snapshot.
		isAuthenticated: failLoud('isAuthenticated') as () => boolean,
		// Fires when an auth-required route is hit with no session.
		onUnauthenticated: failLoud('onUnauthenticated'),
		// Fires when an authenticated user reaches a public-exclusive route
		// (e.g. login).
		onAuthenticatedExclusive: failLoud('onAuthenticatedExclusive'),
	},
	'routeGuardConfig',
)

export const wireRouteGuards = action(
	(config: {
		isAuthenticated: () => boolean
		onUnauthenticated: () => void
		onAuthenticatedExclusive: () => void
	}) => {
		routeGuardConfig.set(config)
	},
	'wireRouteGuards',
)

// Auth-required branch (a layout route): authenticated users pass through and
// every child page inherits the guard; otherwise `onUnauthenticated` owns the
// redirect and the branch renders nothing.
//
// A pathless route matches as broadly as its parent — and the parent is the
// root, which matches every URL — so this params() evaluates on public pages
// too. The public-path check hands ownership back before any redirect fires;
// without it an unauthenticated visitor would be pushed toward login even
// when already there by a guard that does not own the page.
export const protectedRoute = rootRoute.reatomRoute(
	{
		layout: true,
		params: () => {
			if (isGuardedPath(urlAtom().pathname, publicExclusiveRoute)) return null
			if (routeGuardConfig().isAuthenticated()) return {}
			routeGuardConfig().onUnauthenticated()
			return null
		},
		render: (self) => self.outlet().filter(Boolean).at(-1) ?? createElement(Fragment),
	},
	'protectedRoute',
)

// Public pages that must NOT be reachable once authenticated (login). Public
// while unauthenticated; otherwise `onAuthenticatedExclusive` owns the
// redirect and the branch renders nothing. The same broad-match rule applies:
// the redirect fires only when the current pathname belongs to one of this
// branch's registered children, never on sibling (protected) pages.
export const publicExclusiveRoute = rootRoute.reatomRoute(
	{
		params: () => {
			if (!routeGuardConfig().isAuthenticated()) return {}
			if (isGuardedPath(urlAtom().pathname, publicExclusiveRoute)) {
				routeGuardConfig().onAuthenticatedExclusive()
			}
			return null
		},
	},
	'publicExclusiveRoute',
)

const isGuardedPath = (pathname: string, branch: typeof publicExclusiveRoute): boolean => {
	for (const childRoute of Object.values(branch.routes)) {
		if (childRoute.path() === pathname) return true
	}
	return false
}
