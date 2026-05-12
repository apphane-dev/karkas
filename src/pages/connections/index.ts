import { m } from '#paraglide/messages.js'
import { withMatchHeaderTrail } from '#shared/model'

import { connectionDetailRoute, connectionsRoute } from './model/routes'

connectionsRoute.match.extend(
	withMatchHeaderTrail(1, {
		label: () => m.nav_connections(),
		href: connectionsRoute.path(),
		backLabel: () => m.connection_back_to_connections(),
	}),
)

connectionDetailRoute.match.extend(
	withMatchHeaderTrail(2, {
		label: () => connectionDetailRoute.loader.data()?.connection.name ?? m.connection_not_found(),
		isLoading: () => connectionDetailRoute.loader.pending() > 0,
	}),
)

export { ConnectionsNavItem } from './ui/ConnectionsNavItem'
