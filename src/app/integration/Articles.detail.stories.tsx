import preview from '#.storybook/preview'
import { App } from '#app/App'
import { articleDetail, articleUpdate } from '#entities/article/mocks/handlers'
// `articleUpdate` is still imported for the server-error story override below.
import { articlesActor as I } from '#pages/articles/testing'
import { button, heading, role } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Articles/Detail',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'articles/1',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const HandlesArticleDetailServerError = meta.story({
	name: 'Article Detail Server Error',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { articleDetail: articleDetail.error },
		},
	},
})

HandlesArticleDetailServerError.test(
	'shows error state when article detail request fails',
	async () => {
		await I.scope(role('main'), async () => {
			await I.seeDetailError()
		})
	},
)

HandlesArticleDetailServerError.test('keeps detail error state when retry also fails', async () => {
	await I.scope(role('main'), async () => {
		await I.seeDetailError()
		await I.retry()
		await I.waitExit(role('status'))
		await I.seeDetailError()
	})
})

export const RecoversAfterArticleDetailRetry = meta.story({
	name: 'Article Detail Retry Success',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { articleDetail: articleDetail.retrySucceeds() },
		},
	},
})

RecoversAfterArticleDetailRetry.test('loads article detail after retry succeeds', async () => {
	await I.scope(role('main'), async () => {
		await I.seeDetailError()
		await I.retry()
		await I.waitExit(role('status'))
		await I.see(heading('Quarterly report').wait())
		await I.seeArticleDetail('Quarterly report')
	})
})

export const HandlesArticleDetailServerErrorMobile = meta.story({
	name: 'Article Detail Server Error (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: HandlesArticleDetailServerError.input.parameters,
	play: () => I.waitExit(role('status')),
})

HandlesArticleDetailServerErrorMobile.test(
	'[mobile] shows error state when article detail request fails',
	async () => {
		await I.scope(role('main'), async () => {
			await I.seeDetailError()
		})
	},
)

export const KeepsLoadingWhenArticleDetailNeverResolves = meta.story({
	name: 'Article Detail Loading State',
	parameters: {
		msw: {
			handlers: { articleDetail: articleDetail.loading },
		},
	},
})

KeepsLoadingWhenArticleDetailNeverResolves.test(
	'shows detail loading state while article detail is pending',
	async () => {
		const detail = await I.see(role('main'))
		await I.seeDetailLoading(detail)
	},
)

export const KeepsLoadingWhenArticleDetailNeverResolvesMobile = meta.story({
	name: 'Article Detail Loading State (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: KeepsLoadingWhenArticleDetailNeverResolves.input.parameters,
})

KeepsLoadingWhenArticleDetailNeverResolvesMobile.test(
	'[mobile] shows detail loading state while article detail is pending',
	async () => {
		const detail = await I.see(role('main'))
		await I.seeDetailLoading(detail)
	},
)

export const EditArticle = meta.story({
	name: 'Edit Article',
	play: () => I.waitExit(role('status')),
})

EditArticle.test('clicking Edit opens the edit form with current values', async () => {
	await I.scope(role('main'), async () => {
		await I.see(button('Edit'))
		await I.openEdit()
		await I.see(role('textbox', 'Title'))
		await I.seeTitleIs('Quarterly report')
		await I.see(role('textbox', 'Description'))
		await I.see(role('combobox'))
		await I.see(button('Cancel'))
	})
})

EditArticle.test('Cancel returns to read mode without saving', async () => {
	await I.scope(role('main'), async () => {
		await I.openEdit()
		await I.fill(role('textbox', 'Title'), 'A discarded title')
		await I.cancelEdit()
		await I.see(button('Edit'))
		await I.dontSee(role('textbox', 'Title'))
	})
})

EditArticle.test('saving updates the title and returns to read mode', async () => {
	await I.scope(role('main'), async () => {
		await I.openEdit()
		await I.fill(role('textbox', 'Title'), 'Updated quarterly report')
		await I.saveArticle()
		await I.seeArticleSavedToast()
		await I.see(button('Edit'))
		await I.see(heading('Updated quarterly report'))
	})
})

EditArticle.test('changing status persists and reflects on return', async () => {
	await I.scope(role('main'), async () => {
		await I.openEdit()
		await I.selectOption(role('combobox'), 'In Progress')
		await I.saveArticle()
		await I.seeArticleSavedToast()
		// A prior save test in this story leaves a stale "Article saved" toast
		// in the global toaster, so `seeArticleSavedToast` can resolve against it
		// before this save transitions to read mode. Wait for the real transition.
		await I.retryTo(() => I.see(button('Edit')), 25)
		await I.seeArticleDetailStatus('In Progress')
	})
})

export const EditArticleServerError = meta.story({
	name: 'Edit Article Server Error',
	play: () => I.waitExit(role('status')),
	parameters: { msw: { handlers: { articleUpdate: articleUpdate.error } } },
})

EditArticleServerError.test(
	'save failure shows an error toast and stays in edit mode',
	async () => {
		await I.scope(role('main'), async () => {
			await I.openEdit()
			await I.fill(role('textbox', 'Title'), 'Will not save')
			await I.saveArticle()
			await I.seeArticleSaveErrorToast()
			await I.see(role('textbox', 'Title'))
		})
	},
)
