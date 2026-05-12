import { retryComputed, wrap } from '@reatom/core'

import { fetchConversationById, fetchConversations } from '#entities/conversation'
import { m } from '#paraglide/messages.js'
import { isApiError } from '#shared/api'
import { rootRoute } from '#shared/router'
import { PageError } from '#widgets/data-page'
import { MasterDetails } from '#widgets/master-details'

import { ChatPageLoading } from '../ui/ChatPageLoading'
import { ConversationList } from '../ui/conversations/ConversationList'
import { MessageThread } from '../ui/thread/MessageThread'
import { MessageThreadLoadingState } from '../ui/thread/MessageThreadLoadingState'
import { MessageThreadNoSelection } from '../ui/thread/MessageThreadNoSelection'
import { MessageThreadNotFound } from '../ui/thread/MessageThreadNotFound'

export const chatRoute = rootRoute.reatomRoute(
	{
		path: 'chat',
		loader: fetchConversations,
		render: (self) => {
			const selectedConversationId = chatConversationRoute()?.conversationId
			const { isFirstPending, isPending, data: conversations } = self.loader.status()
			if (isFirstPending || (isPending && !conversations)) {
				return <ChatPageLoading showDetail={selectedConversationId !== undefined} />
			}
			if (!conversations) {
				return (
					<PageError
						title={m.chat_error_title()}
						description={m.chat_error_description()}
						onRetry={wrap(() => retryComputed(self.loader))}
					/>
				)
			}

			return (
				<MasterDetails
					isDetailVisible={selectedConversationId !== undefined}
					masterWidth="320px"
					masterLabel={m.nav_chat()}
					detailLabel={m.chat_conversation_detail()}
					master={
						<ConversationList
							conversations={conversations.map((conversation) => ({
								conversation,
								href: chatConversationRoute.path({ conversationId: conversation.id }),
							}))}
							selectedId={selectedConversationId}
						/>
					}
					detail={self.outlet().at(0) ?? <MessageThreadNoSelection />}
				/>
			)
		},
	},
	'chat',
)

export const chatConversationRoute = chatRoute.reatomRoute(
	{
		path: ':conversationId',
		loader: ({ conversationId }) => fetchConversationById(conversationId),
		render: (self) => {
			const { isPending, data: conversation } = self.loader.status()
			const error = self.loader.error()
			if (isPending) return <MessageThreadLoadingState />
			if (error && !(isApiError(error) && error.status === 404)) {
				return (
					<PageError
						title={m.chat_detail_error_title()}
						description={m.chat_detail_error_description()}
						onRetry={wrap(() => retryComputed(self.loader))}
					/>
				)
			}
			return conversation ? (
				<MessageThread conversation={conversation} />
			) : (
				<MessageThreadNotFound conversationId={self().conversationId} />
			)
		},
	},
	'chatConversation',
)
