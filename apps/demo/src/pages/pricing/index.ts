import { m } from '#paraglide/messages.js'
import { withMatchHeaderTrail } from '#shared/model'

import { pricingRoute } from './model/routes'

pricingRoute.match.extend(withMatchHeaderTrail(1, { label: () => m.nav_pricing() }))

export { PricingSidebarItem } from './ui/PricingSidebarItem'
