import { reatomComponent } from '@reatom/react'
import { Link2 } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { SideNavButton, SideNavItemContent } from '#widgets/side-nav'

import { connectionsRoute } from '../model/routes'

export const ConnectionsNavItem = reatomComponent(
	() => (
		<a href={connectionsRoute.path()}>
			<SideNavButton active={connectionsRoute.match()}>
				<SideNavItemContent Icon={Link2} label={m.nav_connections()} />
			</SideNavButton>
		</a>
	),
	'ConnectionsNavItem',
)
