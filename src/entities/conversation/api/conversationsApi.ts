import type { Conversation, Message } from '#entities/conversation/model/types'

import { apiClient } from '#shared/api'

export const CONVERSATIONS_API_PATH = '/chat/conversations'
export const CONVERSATIONS_UNREAD_COUNT_API_PATH = '/chat/conversations/unread-count'

export async function fetchConversations() {
	return apiClient.get<Conversation[]>(CONVERSATIONS_API_PATH)
}

export async function fetchConversationById(conversationId: string) {
	return apiClient.get<Conversation>(`${CONVERSATIONS_API_PATH}/${conversationId}`)
}

export async function sendMessage(conversationId: string, text: string) {
	return apiClient.post<Message>(`${CONVERSATIONS_API_PATH}/${conversationId}/messages`, {
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
