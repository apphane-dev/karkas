import { urlAtom, withChangeHook } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { isAuthenticatedAtom } from '#entities/auth'
import { dashboardRoute } from '#pages/dashboard'
import { loginRoute } from '#pages/login'
import { m } from '#paraglide/messages.js'
import { Toaster } from '#shared/components'
import { documentTitleAtom, localeAtom } from '#shared/model'
import { rootRoute } from '#shared/router'
import { styled } from '#styled-system/jsx'
import { AppShell } from '#widgets/app-shell'

import { HeaderBreadcrumbs } from './HeaderBreadcrumbs'
import { MobileHeader } from './MobileHeader'
import { OrgSwitcher } from './OrgSwitcher'
import { SidebarFooterNavigation } from './SidebarFooterNavigation'
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

	return (
		<>
			<AppShell
				appName={m.app_name()}
				sidebarContent={<SidebarNavigation />}
				sidebarFooter={
					<styled.div display="flex" flexDirection="column" gap="3">
						<SidebarFooterNavigation />
						<OrgSwitcher />
					</styled.div>
				}
				mobileHeader={<MobileHeader />}
				breadcrumbs={<HeaderBreadcrumbs />}
			>
				{rootRoute.render()}
			</AppShell>
			<Toaster />
		</>
	)
}, 'App')
