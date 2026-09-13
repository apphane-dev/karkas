import { urlAtom, withChangeHook, wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { isAuthenticatedAtom } from '#entities/auth'
import { currentOrgIdAtom, orgsAtom, resolveCurrentOrgAction } from '#entities/org'
import { dashboardRoute } from '#pages/dashboard'
import { loginRoute } from '#pages/login'
import { NotFoundPage } from '#pages/not-found'
import { m } from '#paraglide/messages.js'
import { rootFrame } from '#setup'
import { Toaster } from '#shared/components'
import { documentTitleAtom, localeAtom } from '#shared/model'
import { rootRoute, wireRouteGuards } from '#shared/router'
import { styled } from '#styled-system/jsx'
import { AppShell } from '#widgets/app-shell'

import { AccountMenu } from './AccountMenu'
import { HeaderBreadcrumbs } from './HeaderBreadcrumbs'
import { MobileHeader } from './MobileHeader'
import { SidebarNavigation } from './SidebarNavigation'

urlAtom.extend(
	withChangeHook(() => {
		// Bare-base visits have no route to guard them; land on the authed root.
		if (rootRoute.exact()) {
			if (isAuthenticatedAtom()) {
				dashboardRoute.go(undefined, true)
			} else {
				loginRoute.go(undefined, true)
			}
		}
	}),
)

// Guard wiring must precede the first navigation: the guards read this config
// while routes match, and an unwired callback fails loud the moment it runs.
// The setup is strict (clearStack), so even this top-level action call needs
// the app's root frame — without it the call throws `missing async stack`.
rootFrame.run(() =>
	wireRouteGuards({
		isAuthenticated: () => isAuthenticatedAtom(),
		onUnauthenticated: () => {
			if (!loginRoute.match()) {
				loginRoute.go(undefined, true)
			}
		},
		onAuthenticatedExclusive: () => {
			if (!dashboardRoute.match()) {
				dashboardRoute.go(undefined, true)
			}
		},
		orgState: async () => {
			const orgs = await wrap(orgsAtom())
			return { hasOrgs: orgs.length > 0 }
		},
		currentOrgId: () => currentOrgIdAtom(),
		// A real product routes org-less accounts to an org-setup page (a sibling
		// of orgGuardRoute's children — the guard's params() already yields to
		// it). The scaffold has no such page; the mock org list is never empty.
		onOrgless: () => {},
		onOrgsReady: () => {
			resolveCurrentOrgAction()
		},
	}),
)

export const App = reatomComponent(() => {
	localeAtom()
	documentTitleAtom()
	if (loginRoute.match()) {
		return (
			<>
				{rootRoute.render()}
				<Toaster />
			</>
		)
	}

	// `rootRoute` is a layout that matches any path under the base. When its
	// outlet is empty, no registered child route (login, dashboard, ...) matched
	// the current URL — render the not-found fallback.
	const outlet = rootRoute.outlet()
	const content = outlet.length > 0 ? rootRoute.render() : <NotFoundPage />

	return (
		<>
			<AppShell
				appName={m.app_name()}
				sidebarContent={<SidebarNavigation />}
				sidebarFooter={
					<styled.div display="flex" flexDirection="column" gap="3">
						<AccountMenu />
					</styled.div>
				}
				mobileHeader={<MobileHeader />}
				breadcrumbs={<HeaderBreadcrumbs />}
			>
				{content}
			</AppShell>
			<Toaster />
		</>
	)
}, 'App')
