import type { Conversation, Message } from '#entities/conversation'

import {
	abortVar,
	action,
	atom,
	framePromise,
	isAbort,
	withAbort,
	withAsync,
	wrap,
} from '@reatom/core'

import { sendMessage } from '#entities/conversation'
import { m } from '#paraglide/messages.js'
import { toaster } from '#shared/components'

const nowTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

const OPTIMISTIC_PREFIX = 'optimistic-'

export function reatomChatThreadModel(conversation: Conversation) {
	const id = conversation.id
	// Local, mutable view of the thread: starts from the loaded messages.
	const messages = atom<Message[]>([...conversation.messages], `chat.${id}.messages`)

	const canSend = (text: string) => text !== ''
	const createOptimisticMessage = (text: string): Message => ({
		id: `${OPTIMISTIC_PREFIX}${crypto.randomUUID()}`,
		sender: 'You',
		text,
		time: nowTime(),
		isOwn: true,
	})
	const removeOptimisticMessage = (optimistic: Message) => {
		messages.set(messages().filter((msg) => msg.id !== optimistic.id))
	}
	const replaceOptimisticMessage = (optimistic: Message, created: Message) => {
		messages.set(messages().map((msg) => (msg.id === optimistic.id ? created : msg)))
	}
	const handleSendError = (error: unknown, optimistic: Message) => {
		removeOptimisticMessage(optimistic)
		if (!isAbort(error)) toaster.create({ title: m.chat_send_error(), type: 'error' })
		return false
	}
	const deliverMessage = async (text: string, optimistic: Message) => {
		const { controller, unsubscribe } = abortVar.subscribe()
		try {
			const created = await wrap(sendMessage(id, text, { signal: controller.signal }))
			replaceOptimisticMessage(optimistic, created)
			return true
		} catch (error) {
			return handleSendError(error, optimistic)
		} finally {
			unsubscribe()
		}
	}

	const send = action(async (text: string) => {
		const trimmed = text.trim()
		if (!canSend(trimmed)) return false

		const optimistic = createOptimisticMessage(trimmed)
		messages.set([...messages(), optimistic])

		// framePromise() must run before any await to stay on the action frame.
		void framePromise().catch(() => {})
		return await wrap(deliverMessage(trimmed, optimistic))
	}, `chat.${id}.send`).extend(withAbort(), withAsync())

	return { id, name: conversation.name, conversation, messages, send }
}

export type ChatThreadModel = ReturnType<typeof reatomChatThreadModel>
