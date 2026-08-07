import type { Conversation } from '#entities/conversation'

import { Avatar } from '#shared/components'
import { styled } from '#styled-system/jsx'

export function ConversationHeaderContent({ conversation }: { conversation: Conversation }) {
	return (
		<styled.div display="flex" alignItems="center" gap="3" minW="0">
			<Avatar.Root w="8" h="8">
				<Avatar.Fallback
					name={conversation.name}
					bg="colorPalette.3"
					fontSize="xs"
					fontWeight="bold"
					color="colorPalette.11"
				/>
			</Avatar.Root>
			<styled.div minW="0">
				<styled.div fontWeight="medium" fontSize="sm" truncate>
					{conversation.name}
				</styled.div>
				<styled.div fontSize="xs" color="muted">
					{conversation.online ? 'Online' : 'Offline'}
				</styled.div>
			</styled.div>
		</styled.div>
	)
}
