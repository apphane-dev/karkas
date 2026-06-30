import type { Conversation, Message } from '#entities/conversation/model/types'

import { apiClient } from '#shared/api'

export const CONVERSATIONS_API_PATH = '/chat/conversations'
export const CONVERSATIONS_UNREAD_COUNT_API_PATH = '/chat/conversations/unread-count'

export async function fetchConversations(options?: Pick<RequestInit, 'signal'>) {
	return apiClient.get<Conversation[]>(CONVERSATIONS_API_PATH, options)
}

export async function fetchConversationById(
	conversationId: string,
	options?: Pick<RequestInit, 'signal'>,
) {
	return apiClient.get<Conversation>(`${CONVERSATIONS_API_PATH}/${conversationId}`, options)
}

export async function sendMessage(
	conversationId: string,
	text: string,
	options?: Pick<RequestInit, 'signal'>,
) {
	return apiClient.post<Message>(`${CONVERSATIONS_API_PATH}/${conversationId}/messages`, {
		...options,
		body: { text },
	})
}

type UnreadCountResponse = {
	unreadCount: number
}

export async function fetchConversationsUnreadCount() {
	const response = await apiClient.get<UnreadCountResponse>(CONVERSATIONS_UNREAD_COUNT_API_PATH)
	return response.unreadCount
}
