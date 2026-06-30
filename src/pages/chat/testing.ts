import type { Canvas } from '#shared/test/loc'

import { expect } from 'storybook/test'

import { m } from '#paraglide/messages.js'
import {
	createActor,
	heading,
	link,
	role,
	text,
	withDetailError,
	withPageError,
	withRetryAndLoading,
} from '#shared/test'

export const chatLoc = {
	conversationNotFoundHeading: heading('Conversation not found'),
	messageThreadLoading: role('status', 'Loading message thread'),
	// The compose input carries a placeholder but no label/aria-label, so its
	// accessible name is empty — target it by placeholder text instead.
	composeInput: (canvas: Canvas) => canvas.getByPlaceholderText('Type a message...'),
	sendButton: role('button', 'Send'),
}

export const chatActor = createActor()
	.extend(withRetryAndLoading('Loading conversations page'))
	.extend(
		withPageError({
			title: 'Could not load conversations',
			description: "We couldn't load the conversations. Try again in a moment.",
		}),
	)
	.extend(
		withDetailError({
			title: 'Could not load conversation',
			description: "We couldn't load this conversation. Try again in a moment.",
		}),
	)
	.extend((I) => {
		const bubbleCount = async () => {
			const log = await I.see(role('log'))
			return log.querySelectorAll(':scope > *').length
		}

		return {
			goBack: async () => {
				await I.click((canvas) => canvas.findByLabelText('Back to conversations'))
			},
			seeConversationNotFound: async (conversationId: string) => {
				await I.see(chatLoc.conversationNotFoundHeading)
				await I.see(text(`No conversation exists for id "${conversationId}".`))
			},
			seeConversationList: async () => {
				await I.scope(role('list', 'Chat'), async () => {
					await I.see(link(/Engineering/i))
					await I.see(link(/Alex Johnson/i))
				})
			},
			// Count message bubbles currently rendered in the thread log. Each message
			// renders as a direct child of role="log", so :scope > * is the bubble count.
			messageCount: bubbleCount,
			// Type a message into the compose box and submit the form.
			sendMessage: async (message: string) => {
				await I.fill(chatLoc.composeInput, message)
				await I.click(chatLoc.sendButton)
			},
			// The just-sent bubble appears inside the thread log.
			seeSentMessage: async (message: string) => {
				await I.retryTo(() => I.see(text(message).within(role('log'))), 25)
			},
			seeComposeCleared: async () => {
				await I.retryTo(() => I.seeInField(chatLoc.composeInput, ''), 25)
			},
			// Assert the thread bubble count is exactly `count`, retrying past re-renders.
			seeMessageCountIs: async (count: number) => {
				await I.retryTo(async () => {
					expect(await bubbleCount()).toBe(count)
				}, 25)
			},
			seeSendErrorToast: async () => {
				await I.retryTo(
					() => I.see(text('Message could not be sent. Try again.').within('global')),
					25,
				)
			},
			// The search input carries a placeholder but no label/aria-label, so its
			// accessible name is empty — target it by placeholder text instead.
			search: async (term: string) => {
				await I.fill((canvas) => canvas.getByPlaceholderText(m.chat_search_placeholder()), term)
			},
			clearSearch: async () => {
				await I.clear((canvas) => canvas.getByPlaceholderText(m.chat_search_placeholder()))
			},
			seeConversationInList: async (name: string | RegExp) => {
				await I.see(link(name))
			},
			dontSeeConversationInList: async (name: string | RegExp) => {
				await I.dontSee(link(name))
			},
		}
	})
