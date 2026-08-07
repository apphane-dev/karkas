import { m } from '#paraglide/messages.js'
import { withMatchHeaderTrail } from '#shared/model'

import { usageRoute } from './model/routes'

usageRoute.match.extend(withMatchHeaderTrail(1, { label: () => m.nav_usage() }))

export { UsageSidebarItem } from './ui/UsageSidebarItem'
