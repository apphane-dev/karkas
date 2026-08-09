import { urlAtom, withChangeHook } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { isAuthenticatedAtom } from '#entities/auth'
import { dashboardRoute } from '#pages/dashboard'
import { loginRoute } from '#pages/login'
import { NotFoundPage } from '#pages/not-found'
import { m } from '#paraglide/messages.js'
import { Toaster } from '#shared/components'
import { documentTitleAtom, localeAtom } from '#shared/model'
import { rootRoute } from '#shared/router'
import { styled } from '#styled-system/jsx'
import { AppShell } from '#widgets/app-shell'

import { AccountMenu } from './AccountMenu'
import { HeaderBreadcrumbs } from './HeaderBreadcrumbs'
import { MobileHeader } from './MobileHeader'
import { SidebarNavigation } from './SidebarNavigation'

urlAtom.extend(
	withChangeHook(() => {
		if (rootRoute.exact()) {
			if (isAuthenticatedAtom()) {
				dashboardRoute.go(undefined, true)
			} else {
				loginRoute.go(undefined, true)
			}
		}
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
