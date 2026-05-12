import { Send } from 'lucide-react'

import type { Conversation } from '#entities/conversation'
import { m } from '#paraglide/messages.js'
import { Button, Input } from '#shared/components'
import { styled } from '#styled-system/jsx'

import { ConversationHeaderContent } from './ConversationHeaderContent'

type Message = Conversation['messages'][number]

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

const MessageLog = ({ conversation }: { conversation: Conversation }) => (
	<styled.div
		role="log"
		aria-label={conversation.name}
		mt="auto"
		display="flex"
		flexDirection="column"
		gap="4"
	>
		{conversation.messages.map((message) => (
			<MessageItem key={message.id} message={message} />
		))}
	</styled.div>
)

export function MessageThread({ conversation }: { conversation: Conversation }) {
	return (
		<styled.div display="flex" flexDirection="column" h="calc(100dvh - var(--app-header-h, 0px))">
			<styled.div
				px="6"
				py="3"
				borderBottomWidth="1px"
				borderColor="border"
				display={{ base: 'none', md: 'flex' }}
				alignItems="center"
				flexShrink={0}
			>
				<ConversationHeaderContent conversation={conversation} />
			</styled.div>

			<styled.div flex="1" overflowY="auto" p="6" display="flex" flexDirection="column">
				<MessageLog conversation={conversation} />
			</styled.div>

			<styled.form
				px="4"
				py="3"
				borderTopWidth="1px"
				borderColor="border"
				flexShrink={0}
				onSubmit={(e) => e.preventDefault()}
			>
				<styled.div display="flex" gap="2" alignItems="center">
					<Input placeholder={m.chat_message_placeholder()} size="sm" flex="1" />
					<Button size="sm" variant="solid">
						<Send />
					</Button>
				</styled.div>
			</styled.form>
		</styled.div>
	)
}
