import { m } from '#paraglide/messages.js'
import { NotFoundState } from '#widgets/data-page'

export function MessageThreadNotFound({ conversationId }: { conversationId: string }) {
	return (
		<NotFoundState
			title={m.chat_not_found()}
			description={m.chat_not_found_description({ conversationId })}
		/>
	)
}
