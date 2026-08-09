import { reatomComponent } from '@reatom/react'
import { Clock } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { SideNavButton, SideNavItemContent } from '#widgets/side-nav'

import { timelineRoute } from '../model/routes'

export const TimelineNavItem = reatomComponent(
	() => (
		<a href={timelineRoute.path()}>
			<SideNavButton active={timelineRoute.match()}>
				<SideNavItemContent Icon={Clock} label={m.nav_timeline()} />
			</SideNavButton>
		</a>
	),
	'TimelineNavItem',
)
