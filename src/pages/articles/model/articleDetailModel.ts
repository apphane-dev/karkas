import type { Article } from '#entities/article'

import {
	abortVar,
	action,
	atom,
	framePromise,
	reatomForm,
	sleep,
	withAbort,
	withAsync,
	wrap,
} from '@reatom/core'

import { updateArticle } from '#entities/article'
import { m } from '#paraglide/messages.js'
import { toaster } from '#shared/components'

const SAVE_DELAY_MS = 300

async function saveWithToast(articleId: string, values: Omit<Article, 'id'>) {
	const id = toaster.create({ title: m.article_saving(), type: 'loading', closable: false })
	void framePromise().catch(() => {})
	try {
		const updated = await wrap(
			updateArticle(articleId, values, { signal: abortVar.require().signal }),
		)
		await wrap(sleep(SAVE_DELAY_MS))
		toaster.update(id, { title: m.article_saved(), type: 'success' })
		return updated
	} catch (error) {
		toaster.remove(id)
		throw error
	}
}

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
			onSubmit: async (values) => await wrap(saveWithToast(id, values)),
		},
	)

	const startEdit = action(() => {
		form.init({
			title: current().title,
			description: current().description,
			status: current().status,
			content: current().content,
		})
		isEditing.set(true)
	}, `article.${id}.startEdit`)

	const save = action(async () => {
		if (!form.focus().dirty) return
		try {
			const updated = await wrap(form.submit())
			current.set(updated)
			form.init({
				title: updated.title,
				description: updated.description,
				status: updated.status,
				content: updated.content,
			})
			isEditing.set(false)
		} catch {
			toaster.create({ title: m.article_save_error(), type: 'error' })
		}
	}, `article.${id}.save`).extend(withAbort(), withAsync())

	return { id, current, isEditing, form, startEdit, save }
}

export type ArticleDetailModel = ReturnType<typeof reatomArticleDetailModel>
