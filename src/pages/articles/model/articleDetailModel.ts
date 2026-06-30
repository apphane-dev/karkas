import type { Article } from '#entities/article'

import { action, atom, framePromise, reatomForm, sleep, withAbort, wrap } from '@reatom/core'

import { updateArticle } from '#entities/article'
import { m } from '#paraglide/messages.js'
import { toaster } from '#shared/components'

const SAVE_DELAY_MS = 300

async function saveWithToast(articleId: string, values: Omit<Article, 'id'>) {
	const id = toaster.create({ title: m.article_saving(), type: 'loading', closable: false })
	let completed = false
	void framePromise()
		.finally(() => {
			if (!completed) toaster.remove(id)
		})
		.catch(() => {})
	try {
		await wrap(updateArticle(articleId, values))
		await wrap(sleep(SAVE_DELAY_MS))
		toaster.update(id, { title: m.article_saved(), type: 'success' })
		completed = true
	} catch (error) {
		toaster.remove(id)
		throw error
	}
}

export function reatomArticleDetailModel(article: Article) {
	const id = article.id
	const current = atom<Article>(article, `article.${id}.current`)
	const isEditing = atom(false, `article.${id}.isEditing`)
	const isSaving = atom(false, `article.${id}.isSaving`)

	const form = reatomForm(
		{
			title: article.title,
			description: article.description,
			status: article.status,
			content: article.content,
		},
		{ name: `article.${id}.editForm` },
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

	const cancelEdit = action(() => {
		isEditing.set(false)
	}, `article.${id}.cancelEdit`)

	const save = action(async () => {
		if (!form.focus().dirty || isSaving()) return
		isSaving.set(true)
		try {
			const values = form()
			await wrap(saveWithToast(id, values))
			current.set({ id, ...values })
			form.init(values)
			isEditing.set(false)
		} catch {
			toaster.create({ title: m.article_save_error(), type: 'error' })
		} finally {
			isSaving.set(false)
		}
	}, `article.${id}.save`).extend(withAbort())

	return { id, current, isEditing, isSaving, form, startEdit, cancelEdit, save }
}

export type ArticleDetailModel = ReturnType<typeof reatomArticleDetailModel>
