import { m } from '#paraglide/messages.js'
import { NotFoundState } from '#widgets/data-page'

export function NotFoundPage() {
	return <NotFoundState title={m.not_found_title()} description={m.not_found_description()} />
}
