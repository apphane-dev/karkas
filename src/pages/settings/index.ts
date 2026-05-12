import { m } from '#paraglide/messages.js'
import { withMatchHeaderTrail } from '#shared/model'

import { settingsRoute } from './model/routes'

settingsRoute.match.extend(withMatchHeaderTrail(1, { label: () => m.nav_settings() }))

export { SettingsNavItem } from './ui/SettingsNavItem'
