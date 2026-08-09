import { m } from '#paraglide/messages.js'
import { withMatchHeaderTrail } from '#shared/model'

import { dashboardRoute } from './model/routes'

dashboardRoute.match.extend(withMatchHeaderTrail(1, { label: () => m.nav_dashboard() }))

export { dashboardRoute }
export { DashboardNavItem } from './ui/DashboardNavItem'
