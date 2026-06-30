import type { Conversation } from '../model/types'

import { assert } from '@reatom/core'
import { HttpResponse, delay, http, type HttpResponseResolver } from 'msw'

import { conversationsMockData } from '#entities/conversation/mocks/data'
import { composeApiUrl } from '#shared/api'
import { Error404 } from '#shared/mocks'
import { neverResolve, to500, withRetrySuccess } from '#shared/mocks/utils'

import {
	CONVERSATIONS_API_PATH,
	CONVERSATIONS_UNREAD_COUNT_API_PATH,
} from '../api/conversationsApi'

const listUrl = composeApiUrl(CONVERSATIONS_API_PATH)
const unreadCountUrl = composeApiUrl(CONVERSATIONS_UNREAD_COUNT_API_PATH)
const detailUrl = composeApiUrl(`${CONVERSATIONS_API_PATH}/:conversationId`)
const sendMessageUrl = composeApiUrl(`${CONVERSATIONS_API_PATH}/:conversationId/messages`)

const nowTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

// Per-story mutable conversation state (keyed by request origin), so a sent
// message persists for that story's refetches without leaking across stories
// or mutating the shared conversationsMockData fixture. Mirrors the pricing
// handler's per-story isolation.
const conversationsByStory = new Map<string, Conversation[]>()

const stateKey = (request: Request) => request.headers.get('referer') ?? 'default'

const storyConversations = (request: Request) => {
	const key = stateKey(request)
	let conversations = conversationsByStory.get(key)
	if (!conversations) {
		conversations = conversationsMockData.map((conversation) => ({
			...conversation,
			messages: conversation.messages.map((message) => ({ ...message })),
		}))
		conversationsByStory.set(key, conversations)
	}
	return conversations
}

const findConversation = (conversations: Conversation[], conversationId: string) => {
	const conversation = conversations.find(({ id }) => id === conversationId)
	assert(conversation, `Conversation with id ${conversationId} not found in mock data`, Error404)
	return conversation
}

const cloneConversation = (conversation: Conversation) => ({
	...conversation,
	messages: conversation.messages.map((message) => ({ ...message })),
})

const conversationListResolver = (async ({ request }) => {
	await delay()

	return HttpResponse.json(storyConversations(request).map(({ messages: _, ...rest }) => rest))
}) satisfies HttpResponseResolver

const conversationUnreadCountResolver = (async ({ request }) => {
	await delay()

	const unreadCount = storyConversations(request).reduce(
		(totalUnread, conversation) => totalUnread + conversation.unread,
		0,
	)

	return HttpResponse.json({ unreadCount })
}) satisfies HttpResponseResolver

const conversationDetailResolver = (async ({ params, request }) => {
	await delay()

	const conversation = findConversation(
		storyConversations(request),
		String(params['conversationId']),
	)

	return HttpResponse.json(cloneConversation(conversation))
}) satisfies HttpResponseResolver

const conversationSendMessageResolver = (async ({ params, request }) => {
	await delay()

	const conversation = findConversation(
		storyConversations(request),
		String(params['conversationId']),
	)

	const { text } = (await request.json()) as { text: string }
	const message = { id: crypto.randomUUID(), sender: 'You', text, time: nowTime(), isOwn: true }
	conversation.messages.push(message)

	return HttpResponse.json(message)
}) satisfies HttpResponseResolver

export const conversationList = {
	default: http.get(listUrl, conversationListResolver),
	error: http.get(listUrl, () => to500()),
	retrySucceeds: () => http.get(listUrl, withRetrySuccess(conversationListResolver)),
	loading: http.get(listUrl, neverResolve),
}

export const conversationUnreadCount = {
	default: http.get(unreadCountUrl, conversationUnreadCountResolver),
}

export const conversationDetail = {
	default: http.get(detailUrl, conversationDetailResolver),
	error: http.get(detailUrl, () => to500()),
	retrySucceeds: () => http.get(detailUrl, withRetrySuccess(conversationDetailResolver)),
	loading: http.get(detailUrl, neverResolve),
}

export const conversationSendMessage = {
	default: http.post(sendMessageUrl, conversationSendMessageResolver),
	error: http.post(sendMessageUrl, () => to500()),
}

export const conversationHandlers = [
	conversationList.default,
	conversationUnreadCount.default,
	conversationDetail.default,
	conversationSendMessage.default,
]
