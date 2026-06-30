import type { Conversation, Message } from '#entities/conversation'

import { action, atom, framePromise, withAbort, wrap } from '@reatom/core'

import { sendMessage } from '#entities/conversation'
import { m } from '#paraglide/messages.js'
import { toaster } from '#shared/components'

const nowTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

const OPTIMISTIC_PREFIX = 'optimistic-'

export function reatomChatThreadModel(conversation: Conversation) {
	const id = conversation.id
	// Local, mutable view of the thread: starts from the loaded messages.
	const messages = atom<Message[]>([...conversation.messages], `chat.${id}.messages`)
	const isSending = atom(false, `chat.${id}.isSending`)

	const send = action(async (text: string) => {
		const trimmed = text.trim()
		if (trimmed === '' || isSending()) return
		isSending.set(true)

		// Optimistic append with a local id; replaced on success.
		const optimistic: Message = {
			id: `${OPTIMISTIC_PREFIX}${crypto.randomUUID()}`,
			sender: 'You',
			text: trimmed,
			time: nowTime(),
			isOwn: true,
		}
		messages.set([...messages(), optimistic])

		// framePromise() must run before any await to stay on the action frame.
		void framePromise().catch(() => {})
		try {
			const created = await wrap(sendMessage(id, trimmed))
			messages.set(messages().map((msg) => (msg.id === optimistic.id ? created : msg)))
		} catch {
			messages.set(messages().filter((msg) => msg.id !== optimistic.id))
			toaster.create({ title: m.chat_send_error(), type: 'error' })
		} finally {
			isSending.set(false)
		}
	}, `chat.${id}.send`).extend(withAbort())

	return { id, name: conversation.name, conversation, messages, isSending, send }
}

export type ChatThreadModel = ReturnType<typeof reatomChatThreadModel>
