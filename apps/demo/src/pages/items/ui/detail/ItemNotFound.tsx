import { m } from '#paraglide/messages.js'
import { NotFoundState } from '#widgets/data-page'

export function ItemNotFound({ itemId }: { itemId: string }) {
	return (
		<NotFoundState
			title={m.item_not_found()}
			description={m.item_not_found_description({ itemId })}
		/>
	)
}
