import type { Article } from '#entities/article'

import { context } from '@reatom/core'
import { afterEach, expect, test, vi } from 'vite-plus/test'

import { updateArticle } from '#entities/article'

import { reatomArticleDetailModel } from './articleDetailModel'

vi.mock('#entities/article', () => ({ updateArticle: vi.fn() }))

afterEach(() => {
	context.reset()
	vi.mocked(updateArticle).mockReset()
})

// `submit.onFulfill` hooks run in the next cleanup-queue tick.
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

const article: Article = {
	id: 'a1',
	title: 'Original',
	description: 'Description',
	status: 'draft',
	content: [],
}

const respondWith = (release: Promise<void>) =>
	vi.mocked(updateArticle).mockImplementation(async (id, values) => {
		await release
		return { id, ...values }
	})

test('a save with nothing typed during the request closes edit mode', async () => {
	respondWith(Promise.resolve())
	const model = reatomArticleDetailModel(article)
	model.startEdit()

	model.form.fields.title.change('Saved')
	await model.form.submit()
	await flush()

	expect(model.current().title).toBe('Saved')
	expect(model.isEditing()).toBe(false)
})

test('an edit typed while the save is in flight keeps edit mode open', async () => {
	let release: (() => void) | undefined
	respondWith(
		new Promise<void>((resolve) => {
			release = resolve
		}),
	)
	const model = reatomArticleDetailModel(article)
	model.startEdit()

	model.form.fields.title.change('Sent')
	const submitted = model.form.submit()
	model.form.fields.title.change('Typed during save')
	release?.()
	await submitted
	await flush()

	expect(model.current().title).toBe('Sent')
	expect(model.form.fields.title.value()).toBe('Typed during save')
	expect(model.isEditing()).toBe(true)
})
