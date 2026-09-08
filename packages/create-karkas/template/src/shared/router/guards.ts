import { action, atom, urlAtom, wrap, withChangeHook } from '@reatom/core'
import { createElement, Fragment } from 'react'

import { createAppPath, rootRoute } from './core'

// Route-guard wiring. The guard routes below are intentionally policy-free:
// they encode the *structure* of a guard (an auth-required branch, a
// public-exclusive branch, an org-required branch) but defer every concrete
// decision — what counts as authenticated, where each redirect goes, how the
// org list is fetched — to callbacks set here by `App.tsx`,
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
// 		orgState: () => ({ hasOrgs: true }),
// 		currentOrgId: () => currentOrgIdAtom(),
// 		onOrgless: () => orgSetupRoute.go(undefined, true),
// 		onOrgsReady: () => resolveCurrentOrgAction(),
// 	})

const failLoud = (name: string) => (): void => {
	throw new Error(
		`routeGuardConfig.${name} is not wired. Set it in App.tsx before routing resolves.`,
	)
}

type OrgsState = {
	hasOrgs: boolean
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
		// Loaded by the org guard's route loader on every scope change. Child
		// route loaders wait for this parent loader, so they receive resolved
		// organization state while their own renders remain responsible for
		// page-specific loading UI. A thunk so the app can read its org-list
		// state fresh at each evaluation instead of firing a side effect.
		orgState: failLoud('orgState') as () => OrgsState | Promise<OrgsState>,
		// Read on every org-guard evaluation and render — a thunk, not a
		// snapshot, so an org switch invalidates the guard and every child
		// loader awaiting it.
		currentOrgId: failLoud('currentOrgId') as () => string | null,
		// Fires when an authenticated, org-less account reaches the org guard.
		onOrgless: failLoud('onOrgless'),
		// Fires once the org list is ready and non-empty (e.g. resolve the
		// active org).
		onOrgsReady: failLoud('onOrgsReady'),
	},
	'routeGuardConfig',
)

export const wireRouteGuards = action(
	(config: {
		isAuthenticated: () => boolean
		onUnauthenticated: () => void
		onAuthenticatedExclusive: () => void
		orgState: () => OrgsState | Promise<OrgsState>
		currentOrgId: () => string | null
		onOrgless: () => void
		onOrgsReady: () => void
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

// Org-required branch (a pathless layout under protectedRoute). Its loader
// owns asynchronous organization readiness; nested page loaders wait for it
// and can render their own page-specific loading state while it is pending.
// Concrete org fetching and redirect targets remain injected by App.
export const orgGuardRoute = protectedRoute.reatomRoute(
	{
		layout: true,
		params: () => {
			// A pathless layout route matches on any URL under its parent, so
			// without this check it would keep rendering its shell even while a
			// sibling page route is the one actually active — e.g. an org-setup
			// page that must render for org-less accounts.
			for (const siblingRoute of Object.values(protectedRoute.routes)) {
				if (!Object.is(siblingRoute, orgGuardRoute) && siblingRoute.match()) {
					return null
				}
			}
			return {}
		},
		async loader() {
			// The sync read makes org changes invalidate this guard and every
			// child loader awaiting it.
			routeGuardConfig().currentOrgId()
			const state = await wrap(routeGuardConfig().orgState())
			if (!state.hasOrgs) {
				routeGuardConfig().onOrgless()
				return null
			}
			routeGuardConfig().onOrgsReady()
			const orgId = routeGuardConfig().currentOrgId()
			return orgId ? { orgId } : null
		},
		render: (self) => {
			const guardState = self.loader.data()
			// Stale-outlet gate: while the next scope resolves after a switch,
			// the fulfilled payload still names the previous org — render nothing
			// rather than paint the old org's page under the new one. An unsettled
			// payload (first load) renders children so their own loading state
			// shows.
			const outlet =
				!guardState || guardState.orgId === routeGuardConfig().currentOrgId()
					? self.outlet()
					: []
			return outlet.filter(Boolean).at(-1) ?? createElement(Fragment)
		},
	},
	'orgGuardRoute',
)

// Cross-org switches collapse deep org-scoped URLs to the app root. The
// entity behind such a path belongs to the previous org and 404s under the
// new one, and route loaders retain their last fulfilled payload across a
// rejection, so staying would paint stale cross-org data or an error page.
// Keyed on the guard's own fulfilled org id changing A -> B, which is exactly
// a switch: boot (undefined -> id), first org selection (undefined -> id via
// the orgless flow), and sign-out (id -> null payload) never fire it, so deep
// links, reloads, and story boots keep their URL. The collapse runs in the
// fulfillment's hooks frame — the guard's own run has settled by then, and
// child loaders unmatch-abort the way every navigation already does.
// Navigating from the org-write transaction instead (a change hook directly
// on the org id atom) races the guard's in-flight rerun and can abort it into
// a permanently pending loader, so the timing here is load-bearing.
const collapseToOrgRoot = action(() => {
	if (urlAtom().pathname === createAppPath()) return
	urlAtom.go(createAppPath())
}, 'orgGuard.collapseToOrgRoot')

orgGuardRoute.loader.data.extend(
	withChangeHook((state, prevState) => {
		if (!prevState?.orgId || !state?.orgId || prevState.orgId === state.orgId) return
		// Deferred into its own action past the fulfillment transaction: a url
		// write from the hooks frame leaks unhandled AbortErrors from the child
		// loaders the navigation supersedes, and a bare deferred write loses the
		// async stack. wrap() carries this frame into the microtask. The guard
		// has already settled, so nothing of its own is in flight; the pathname
		// check inside keeps repeated switches from looping.
		queueMicrotask(wrap(collapseToOrgRoot))
	}),
)

const isGuardedPath = (pathname: string, branch: typeof publicExclusiveRoute): boolean => {
	for (const childRoute of Object.values(branch.routes)) {
		if (childRoute.path() === pathname) return true
	}
	return false
}
