import { m } from '#paraglide/messages.js'
import { NotFoundState } from '#widgets/data-page'

export function ConnectionNotFound({ connectionId }: { connectionId: string }) {
	return (
		<NotFoundState
			title={m.connection_not_found()}
			description={m.connection_not_found_description({ connectionId })}
		/>
	)
}
