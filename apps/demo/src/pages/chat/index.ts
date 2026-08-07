import { m } from '#paraglide/messages.js'
import { withMatchHeaderTrail, withMatchMobileHeaderOverride } from '#shared/model'

import { chatConversationRoute, chatRoute } from './model/routes'
import { ChatConversationMobileHeader } from './ui/thread/ChatConversationMobileHeader'

chatRoute.match.extend(
	withMatchHeaderTrail(1, {
		label: () => m.nav_chat(),
		href: chatRoute.path(),
		backLabel: () => m.chat_back_to_conversations(),
	}),
)

chatConversationRoute.match.extend(
	withMatchHeaderTrail(2, {
		label: () => chatConversationRoute.loader.data()?.name ?? m.chat_not_found(),
		isLoading: () => chatConversationRoute.loader.pending() > 0,
	}),
	withMatchMobileHeaderOverride(ChatConversationMobileHeader),
)

export { ChatNavItem } from './ui/ChatNavItem'
