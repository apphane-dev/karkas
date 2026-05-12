import type { Conversation } from '#entities/conversation/model/types'
import { apiClient } from '#shared/api'

export const CONVERSATIONS_API_PATH = '/chat/conversations'
export const CONVERSATIONS_UNREAD_COUNT_API_PATH = '/chat/conversations/unread-count'

export async function fetchConversations() {
	return apiClient.get<Conversation[]>(CONVERSATIONS_API_PATH)
}

export async function fetchConversationById(conversationId: string) {
	return apiClient.get<Conversation>(`${CONVERSATIONS_API_PATH}/${conversationId}`)
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const getUnreadFromConversation = (conversation: unknown) => {
	if (!isRecord(conversation)) return 0
	return typeof conversation['unread'] === 'number' ? conversation['unread'] : 0
}

const getUnreadFromObject = (response: Record<string, unknown>): number | undefined => {
	const fields = ['unreadCount', 'count', 'total']
	const found = fields.find((field) => typeof response[field] === 'number')
	return found ? (response[found] as number) : undefined
}

const normalizeUnreadCountResponse = (response: unknown): number | undefined => {
	if (typeof response === 'number') return response
	if (Array.isArray(response)) {
		return response.reduce<number>((total, item) => total + getUnreadFromConversation(item), 0)
	}
	if (isRecord(response)) return getUnreadFromObject(response)
	return undefined
}

export async function fetchConversationsUnreadCount() {
	const response = await apiClient.get<unknown>(CONVERSATIONS_UNREAD_COUNT_API_PATH)
	const unreadCount = normalizeUnreadCountResponse(response)

	if (unreadCount !== undefined) return unreadCount
	throw new Error('Unexpected unread count response shape')
}
