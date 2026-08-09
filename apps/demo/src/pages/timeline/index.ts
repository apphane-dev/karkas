import { m } from '#paraglide/messages.js'
import { withMatchHeaderTrail } from '#shared/model'

import { timelineRoute } from './model/routes'

timelineRoute.match.extend(withMatchHeaderTrail(1, { label: () => m.nav_timeline() }))

export { TimelineNavItem } from './ui/TimelineNavItem'
