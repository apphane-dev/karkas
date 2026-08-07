import { Link2 } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { NoSelectionState } from '#widgets/data-page'

export function ConnectionNoSelection() {
	return (
		<NoSelectionState
			icon={Link2}
			title={m.connection_no_selection()}
			description={m.connection_no_selection_desc()}
		/>
	)
}
