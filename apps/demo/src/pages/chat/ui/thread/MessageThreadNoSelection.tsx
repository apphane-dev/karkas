import { MessageSquare } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { NoSelectionState } from '#widgets/data-page'

export function MessageThreadNoSelection() {
	return (
		<NoSelectionState
			icon={MessageSquare}
			title={m.chat_no_selection()}
			description={m.chat_no_selection_desc()}
		/>
	)
}
