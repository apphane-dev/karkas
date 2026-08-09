import { m } from '#paraglide/messages.js'
import { styled } from '#styled-system/jsx'

import { ConversationListLoading } from './conversations/ConversationListLoading'
import { MessageThreadLoadingState } from './thread/MessageThreadLoadingState'

export function ChatPageLoading({ showDetail }: { showDetail: boolean }) {
	return (
		<div role="status" aria-label={m.chat_loading_page()}>
			<div inert>
				<styled.div display={{ base: 'none', md: 'flex' }}>
					<styled.div
						w="320px"
						flexShrink={0}
						borderRightWidth="1px"
						borderColor="border"
						h="calc(100dvh - var(--app-header-h, 0px))"
						position="sticky"
						top="var(--app-header-h, 0px)"
						overflowY="auto"
					>
						<ConversationListLoading />
					</styled.div>
					<styled.div flex="1" minW="0">
						<MessageThreadLoadingState />
					</styled.div>
				</styled.div>

				<styled.div display={{ base: 'block', md: 'none' }}>
					{showDetail ? <MessageThreadLoadingState /> : <ConversationListLoading />}
				</styled.div>
			</div>
		</div>
	)
}
