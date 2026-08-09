import { FileText } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { NoSelectionState } from '#widgets/data-page'

export function ArticleNoSelection() {
	return (
		<NoSelectionState
			icon={FileText}
			title={m.article_no_selection()}
			description={m.article_no_selection_desc()}
		/>
	)
}
