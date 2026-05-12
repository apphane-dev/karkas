import { m } from '#paraglide/messages.js'
import { withMatchHeaderTrail } from '#shared/model'

import { timerRoute } from './model/routes'

timerRoute.match.extend(withMatchHeaderTrail(1, { label: () => m.nav_timer() }))

export { TimerNavItem } from './ui/TimerNavItem'
