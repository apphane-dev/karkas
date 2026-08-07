import type { Message } from '#entities/conversation'
import type { ChatThreadModel } from '../../model/chatThreadModel'

import { wrap } from '@reatom/core'
import { reatomComponent, useAtom } from '@reatom/react'
import { Send } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { Button, Input } from '#shared/components'
import { styled } from '#styled-system/jsx'

import { ConversationHeaderContent } from './ConversationHeaderContent'

const MessageSender = ({ message }: { message: Message }) => {
	if (message.isOwn) return null

	return (
		<styled.span fontSize="xs" fontWeight="medium" mb="1" color="muted">
			{message.sender}
		</styled.span>
	)
}

const MessageBubble = ({ message }: { message: Message }) => (
	<styled.div
		px="4"
		py="2.5"
		borderRadius="xl"
		bg={message.isOwn ? 'colorPalette.9' : 'gray.3'}
		color={message.isOwn ? 'white' : 'inherit'}
		fontSize="sm"
		lineHeight="relaxed"
		borderBottomRightRadius={message.isOwn ? 'sm' : 'xl'}
		borderBottomLeftRadius={message.isOwn ? 'xl' : 'sm'}
	>
		{message.text}
	</styled.div>
)

const MessageItem = ({ message }: { message: Message }) => (
	<styled.div
		display="flex"
		flexDirection="column"
		alignItems={message.isOwn ? 'flex-end' : 'flex-start'}
		maxW="75%"
		alignSelf={message.isOwn ? 'flex-end' : 'flex-start'}
	>
		<MessageSender message={message} />
		<MessageBubble message={message} />
		<styled.span fontSize="2xs" color="muted" mt="1">
			{message.time}
		</styled.span>
	</styled.div>
)

const MessageLog = ({ messages, name }: { messages: Message[]; name: string }) => (
	<styled.div role="log" aria-label={name} mt="auto" display="flex" flexDirection="column" gap="4">
		{messages.map((message) => (
			<MessageItem key={message.id} message={message} />
		))}
	</styled.div>
)

export const MessageThread = reatomComponent(({ model }: { model: ChatThreadModel }) => {
	const [draft, setDraft] = useAtom('')
	const { conversation, messages, send } = model

	const handleSubmit = wrap(async () => {
		if (draft.trim() === '') {
			setDraft('')
			return
		}

		const sent = await wrap(send(draft))
		if (sent) setDraft('')
	})

	return (
		<styled.div display="flex" flexDirection="column" h="calc(100dvh - var(--app-header-h, 0px))">
			<styled.div
				px="6"
				py="3"
				borderBottomWidth="1px"
				borderColor="border"
				display={{ base: 'none', md: 'flex' }}
				alignItems="center"
				flexShrink="0"
			>
				<ConversationHeaderContent conversation={conversation} />
			</styled.div>

			<styled.div flex="1" overflowY="auto" p="6" display="flex" flexDirection="column">
				<MessageLog messages={messages()} name={model.name} />
			</styled.div>

			<styled.form
				px="4"
				py="3"
				borderTopWidth="1px"
				borderColor="border"
				flexShrink="0"
				onSubmit={(e) => {
					e.preventDefault()
					handleSubmit()
				}}
			>
				<styled.div display="flex" gap="2" alignItems="center">
					<Input
						placeholder={m.chat_message_placeholder()}
						size="sm"
						flex="1"
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						disabled={!send.ready()}
					/>
					<Button
						type="submit"
						size="sm"
						variant="solid"
						aria-label={m.chat_send()}
						disabled={!send.ready()}
					>
						<Send />
					</Button>
				</styled.div>
			</styled.form>
		</styled.div>
	)
}, 'MessageThread')
