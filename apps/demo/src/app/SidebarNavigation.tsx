import { ArticlesNavItem } from '#pages/articles'
import { CalculatorNavItem } from '#pages/calculator'
import { ChatNavItem } from '#pages/chat'
import { ConnectionsNavItem } from '#pages/connections'
import { DashboardNavItem } from '#pages/dashboard'
import { ItemsNavItem } from '#pages/items'
import { SettingsNavItem } from '#pages/settings'
import { TimelineNavItem } from '#pages/timeline'
import { TimerNavItem } from '#pages/timer'

export const SidebarNavigation = () => (
	<>
		<DashboardNavItem />
		<ArticlesNavItem />
		<ConnectionsNavItem />
		<ItemsNavItem />
		<ChatNavItem />
		<TimelineNavItem />
		<CalculatorNavItem />
		<TimerNavItem />
		<SettingsNavItem />
	</>
)
