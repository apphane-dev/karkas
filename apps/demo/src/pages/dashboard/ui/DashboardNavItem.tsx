import { reatomComponent } from '@reatom/react'
import { LayoutDashboard } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { SideNavButton, SideNavItemContent } from '#widgets/side-nav'

import { dashboardRoute } from '../model/routes'

export const DashboardNavItem = reatomComponent(
	() => (
		<a href={dashboardRoute.path()}>
			<SideNavButton active={dashboardRoute.match()}>
				<SideNavItemContent Icon={LayoutDashboard} label={m.nav_dashboard()} />
			</SideNavButton>
		</a>
	),
	'DashboardNavItem',
)
