import { m } from '#paraglide/messages.js'
import { withMatchHeaderTrail } from '#shared/model'

import { itemDetailRoute, itemsRoute } from './model/routes'

itemsRoute.match.extend(
	withMatchHeaderTrail(1, {
		label: () => m.nav_items(),
		href: itemsRoute.path(),
	}),
)

itemDetailRoute.match.extend(
	withMatchHeaderTrail(2, {
		label: () => itemDetailRoute.loader.data()?.name ?? itemDetailRoute()?.itemId ?? m.nav_items(),
		isLoading: () => itemDetailRoute.loader.pending() > 0,
	}),
)

export { ItemsNavItem } from './ui/ItemsNavItem'
