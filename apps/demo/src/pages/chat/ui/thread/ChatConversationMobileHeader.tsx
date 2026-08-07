import { reatomComponent } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import { BackButton, MobileHeader, MobileHeaderTitle } from '#widgets/mobile-header'

import { chatConversationRoute, chatRoute } from '../../model/routes'
import { ConversationHeaderContent } from './ConversationHeaderContent'
import { ConversationHeaderContentLoading } from './ConversationHeaderContentLoading'

export const ChatConversationMobileHeader = reatomComponent(() => {
	const conversation = chatConversationRoute.loader.data()?.conversation
	const isLoadingConversation = chatConversationRoute.loader.pending() > 0
	return (
		<MobileHeader
			button={<BackButton href={chatRoute.path()} label={m.chat_back_to_conversations()} />}
		>
			{isLoadingConversation ? (
				<ConversationHeaderContentLoading />
			) : conversation ? (
				<ConversationHeaderContent conversation={conversation} />
			) : (
				<MobileHeaderTitle label={m.chat_not_found()} />
			)}
		</MobileHeader>
	)
}, 'ChatConversationMobileHeader')
