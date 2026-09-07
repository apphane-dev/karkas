import type { Article } from '#entities/article'

import { abortVar, action, atom, reatomForm, wrap } from '@reatom/core'

import { updateArticle } from '#entities/article'
import { withSavedState } from '#shared/reatom'

export function reatomArticleDetailModel(article: Article) {
	const id = article.id
	const current = atom<Article>(article, `article.${id}.current`)
	const isEditing = atom(false, `article.${id}.isEditing`)

	const form = reatomForm(
		{
			title: article.title,
			description: article.description,
			status: article.status,
			content: article.content,
		},
		{
			name: `article.${id}.editForm`,
			onSubmit: async (values) => {
				const updated = await wrap(updateArticle(id, values, { signal: abortVar.require().signal }))
				// The summary rows move when the request lands; withSavedState then
				// rebaselines the form and its onSaved collapses back to them —
				// seeing the new values on the rows is what confirms the save.
				current.set(updated)
				return updated
			},
		},
	).extend(withSavedState({ onSaved: () => isEditing.set(false) }))

	const startEdit = action(() => {
		form.init({
			title: current().title,
			description: current().description,
			status: current().status,
			content: current().content,
		})
		isEditing.set(true)
	}, `article.${id}.startEdit`)

	return { id, current, isEditing, form, startEdit }
}

export type ArticleDetailModel = ReturnType<typeof reatomArticleDetailModel>
