import type { Conversation } from '#entities/conversation'

import { SquarePen } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { Avatar, Badge, IconButton } from '#shared/components'
import { styled } from '#styled-system/jsx'
import { ListToolbar } from '#widgets/data-page'

type Props = {
	conversations: { conversation: Conversation; href: string }[]
	selectedId: string | undefined
}

export function ConversationList({ conversations, selectedId }: Props) {
	return (
		<>
			<ListToolbar placeholder={m.chat_search_placeholder()}>
				<IconButton size="sm" variant="outline" aria-label={m.chat_new_conversation()}>
					<SquarePen />
				</IconButton>
			</ListToolbar>
			<styled.ul role="list" aria-label={m.nav_chat()}>
				{conversations.map(({ conversation, href }) => (
					<styled.li key={conversation.id}>
						<styled.a
							href={href}
							display="flex"
							alignItems="center"
							gap="3"
							px="4"
							py="3"
							cursor="pointer"
							textDecoration="none"
							color="inherit"
							bg={selectedId === conversation.id ? 'colorPalette.surface.bg.active' : 'transparent'}
							_hover={{ bg: 'colorPalette.surface.bg.active' }}
							borderBottomWidth="1px"
							borderColor="border"
							aria-current={selectedId === conversation.id ? 'page' : undefined}
						>
							<styled.div position="relative" flexShrink={0}>
								<Avatar.Root w="10" h="10">
									<Avatar.Fallback
										name={conversation.name}
										bg="colorPalette.3"
										fontSize="sm"
										fontWeight="bold"
										color="colorPalette.11"
									/>
								</Avatar.Root>
								{conversation.online && (
									<styled.div
										position="absolute"
										bottom="0"
										right="0"
										w="3"
										h="3"
										borderRadius="full"
										bg="green.9"
										borderWidth="2px"
										borderColor="gray.1"
									/>
								)}
							</styled.div>

							<styled.div flex="1" minW="0">
								<styled.div
									display="flex"
									justifyContent="space-between"
									alignItems="center"
									mb="0.5"
								>
									<styled.span fontWeight="medium" fontSize="sm" truncate>
										{conversation.name}
									</styled.span>
									<styled.span fontSize="xs" color="muted" flexShrink={0}>
										{conversation.time}
									</styled.span>
								</styled.div>
								<styled.div display="flex" justifyContent="space-between" alignItems="center">
									<styled.span fontSize="xs" color="muted" truncate>
										{conversation.lastMessage}
									</styled.span>
									{conversation.unread > 0 && (
										<Badge
											size="sm"
											bg="indigo.solid.bg"
											color="indigo.solid.fg"
											borderRadius="full"
											minW="5"
											textAlign="center"
										>
											{conversation.unread}
										</Badge>
									)}
								</styled.div>
							</styled.div>
						</styled.a>
					</styled.li>
				))}
			</styled.ul>
		</>
	)
}
