import { m } from '#paraglide/messages.js'
import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

const messageRows = Array.from({ length: 6 }, (_, index) => index)

export function MessageThreadLoadingState() {
	return (
		<styled.div
			role="status"
			aria-label={m.chat_loading_message_thread()}
			display="flex"
			flexDirection="column"
			h="calc(100dvh - var(--app-header-h, 0px))"
		>
			<styled.div
				px="6"
				py="3"
				borderBottomWidth="1px"
				borderColor="border"
				display="flex"
				alignItems="center"
				gap="3"
				flexShrink={0}
			>
				<Skeleton h="8" w="8" borderRadius="full" />
				<styled.div>
					<Skeleton h="4" w="32" mb="1.5" />
					<Skeleton h="3" w="16" />
				</styled.div>
			</styled.div>

			<styled.div flex="1" overflowY="auto" p="6" display="flex" flexDirection="column" gap="4">
				{messageRows.map((message) => (
					<styled.div
						key={message}
						display="flex"
						flexDirection="column"
						alignItems={message % 2 === 0 ? 'flex-start' : 'flex-end'}
						maxW="75%"
						alignSelf={message % 2 === 0 ? 'flex-start' : 'flex-end'}
					>
						<Skeleton
							h="14"
							w={message % 2 === 0 ? '260px' : '220px'}
							borderRadius="xl"
							opacity={message % 2 === 0 ? undefined : 0.8}
						/>
						<Skeleton h="3" w="12" mt="1.5" />
					</styled.div>
				))}
			</styled.div>

			<styled.div px="4" py="3" borderTopWidth="1px" borderColor="border" flexShrink={0}>
				<Skeleton h="9" w="100%" borderRadius="md" />
			</styled.div>
		</styled.div>
	)
}
