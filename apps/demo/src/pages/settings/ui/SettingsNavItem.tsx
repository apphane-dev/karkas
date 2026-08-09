import { reatomComponent } from '@reatom/react'
import { Settings } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { SideNavButton, SideNavItemContent } from '#widgets/side-nav'

import { settingsRoute } from '../model/routes'

export const SettingsNavItem = reatomComponent(
	() => (
		<a href={settingsRoute.path()}>
			<SideNavButton active={settingsRoute.match()}>
				<SideNavItemContent Icon={Settings} label={m.nav_settings()} />
			</SideNavButton>
		</a>
	),
	'SettingsNavItem',
)
