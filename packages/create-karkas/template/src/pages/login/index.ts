import { m } from '#paraglide/messages.js'
import { withMatchHeaderTrail } from '#shared/model'

import { loginRoute } from './model/routes'

loginRoute.match.extend(withMatchHeaderTrail(1, { label: () => m.login_title() }))

export { loginRoute }
