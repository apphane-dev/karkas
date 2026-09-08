import type { Article } from '#entities/article'

import { abortVar, atom, reatomForm, wrap } from '@reatom/core'

import { updateArticle } from '#entities/article'
import { withSavedState } from '#shared/reatom'

export function reatomArticleDetailModel(article: Article) {
	const id = article.id
	const current = atom<Article>(article, `article.${id}.current`)

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
				// rebaselines the form, so the closed card states the saved values —
				// seeing the new values on the rows is what confirms the save.
				current.set(updated)
				// withSavedState rebaselines through form.init, whose keys must be
				// field names exactly: returning the full Article (with `id`) would
				// throw `Field id not found in fields`.
				const { id: _, ...fields } = updated
				return fields
			},
		},
	).extend(withSavedState())

	return { id, current, form }
}

export type ArticleDetailModel = ReturnType<typeof reatomArticleDetailModel>
