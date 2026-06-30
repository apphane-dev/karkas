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

const conversationListResolver = (async () => {
	await delay()

	return HttpResponse.json(conversationsMockData.map(({ messages: _, ...rest }) => rest))
}) satisfies HttpResponseResolver

const conversationUnreadCountResolver = (async () => {
	await delay()

	const unreadCount = conversationsMockData.reduce(
		(totalUnread, conversation) => totalUnread + conversation.unread,
		0,
	)

	return HttpResponse.json({ unreadCount })
}) satisfies HttpResponseResolver

const conversationDetailResolver = (async ({ params }) => {
	await delay()

	const conversationId = params['conversationId']
	const conversation = conversationsMockData.find(({ id }) => id === conversationId)
	assert(conversation, `Conversation with id ${conversationId} not found in mock data`, Error404)

	return HttpResponse.json(conversation)
}) satisfies HttpResponseResolver

const conversationSendMessageResolver = (async ({ params, request }) => {
	await delay()

	const conversationId = params['conversationId']
	const conversation = conversationsMockData.find(({ id }) => id === conversationId)
	assert(conversation, `Conversation with id ${conversationId} not found in mock data`, Error404)

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
