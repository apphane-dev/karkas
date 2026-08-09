import { reatomComponent } from '@reatom/react'
import { Package } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { SideNavButton, SideNavItemContent } from '#widgets/side-nav'

import { itemsRoute } from '../model/routes'

export const ItemsNavItem = reatomComponent(
	() => (
		<a href={itemsRoute.path()}>
			<SideNavButton active={itemsRoute.match()}>
				<SideNavItemContent Icon={Package} label={m.nav_items()} />
			</SideNavButton>
		</a>
	),
	'ItemsNavItem',
)
