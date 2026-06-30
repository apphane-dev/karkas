import { abortVar, retryComputed, wrap } from '@reatom/core'

import { protectedRoute } from '#entities/auth'
import { fetchConversationById, fetchConversations } from '#entities/conversation'
import { m } from '#paraglide/messages.js'
import { isApiError } from '#shared/api'
import { PageError } from '#widgets/data-page'
import { MasterDetails } from '#widgets/master-details'

import { ChatPageLoading } from '../ui/ChatPageLoading'
import { ConversationList } from '../ui/conversations/ConversationList'
import { MessageThread } from '../ui/thread/MessageThread'
import { MessageThreadLoadingState } from '../ui/thread/MessageThreadLoadingState'
import { MessageThreadNoSelection } from '../ui/thread/MessageThreadNoSelection'
import { MessageThreadNotFound } from '../ui/thread/MessageThreadNotFound'
import { reatomChatThreadModel } from './chatThreadModel'

const fetchConversationsForRoute = async () =>
	await wrap(fetchConversations({ signal: abortVar.require().signal }))

export const chatRoute = protectedRoute.reatomRoute(
	{
		path: 'chat',
		layout: true,
		loader: fetchConversationsForRoute,
		render: (self) => {
			const detail = self.outlet().at(0)
			const selectedConversationId = chatConversationRoute()?.conversationId
			const isDetailVisible = selectedConversationId !== undefined || detail !== undefined
			const { isFirstPending, isPending, data: conversations } = self.loader.status()
			if (isFirstPending || (isPending && !conversations)) {
				return <ChatPageLoading showDetail={isDetailVisible} />
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
					isDetailVisible={isDetailVisible}
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
					detail={detail ?? <MessageThreadNoSelection />}
				/>
			)
		},
	},
	'chat',
)

export const chatConversationRoute = chatRoute.reatomRoute(
	{
		path: ':conversationId',
		loader: async ({ conversationId }) =>
			reatomChatThreadModel(
				await wrap(fetchConversationById(conversationId, { signal: abortVar.require().signal })),
			),
		render: (self) => {
			const { isPending, data: model } = self.loader.status()
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
			return model ? (
				<MessageThread model={model} />
			) : (
				<MessageThreadNotFound conversationId={self().conversationId} />
			)
		},
	},
	'chatConversation',
)
