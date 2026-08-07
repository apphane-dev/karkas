import { m } from '#paraglide/messages.js'
import { NotFoundState } from '#widgets/data-page'

export function ArticleNotFound({ articleId }: { articleId: string }) {
	return (
		<NotFoundState
			title={m.article_not_found()}
			description={m.article_not_found_description({ articleId })}
		/>
	)
}
