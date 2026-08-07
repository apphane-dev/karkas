import preview from '#.storybook/preview'
import { App } from '#app/App'
import { articleList } from '#entities/article/mocks/handlers'
import { articlesActor as I } from '#pages/articles/testing'
import { role, text } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Articles/List Request',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'articles',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

const articleListRetryHandler = articleList.retrySucceeds()

export const HandlesArticlesLoadServerError = meta.story({
	name: 'Articles Load Server Error',

	beforeEach({ msw }) {
		msw.use(articleList.error)
	},

	play: () => I.waitExit(role('status')),
})

HandlesArticlesLoadServerError.test('shows error state when articles request fails', async () => {
	await I.seeError()
	await I.see(text("We couldn't load the article list. Try again in a moment."))
})

HandlesArticlesLoadServerError.test('keeps error state when retry also fails', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.seeError()
})

export const RecoversAfterArticlesLoadRetry = meta.story({
	name: 'Articles Load Retry Success',
	play: () => I.waitExit(role('status')),

	beforeEach({ msw }) {
		msw.use(articleListRetryHandler)
	},
})

RecoversAfterArticlesLoadRetry.test('loads article list after retry succeeds', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.see(role('list', 'Articles').wait())
	await I.seeArticleList()
})

export const HandlesArticlesLoadServerErrorMobile = meta.story({
	name: 'Articles Load Server Error (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	beforeEach: HandlesArticlesLoadServerError.input.beforeEach,
	play: () => I.waitExit(role('status')),
})

HandlesArticlesLoadServerErrorMobile.test(
	'[mobile] shows error state when articles request fails',
	async () => {
		await I.seeError()
		await I.see(text("We couldn't load the article list. Try again in a moment."))
	},
)

export const KeepsLoadingWhenArticlesRequestNeverResolves = meta.story({
	name: 'Articles Request Loading State',

	beforeEach({ msw }) {
		msw.use(articleList.loading)
	},
})

KeepsLoadingWhenArticlesRequestNeverResolves.test(
	'keeps loading state for pending articles request',
	async () => {
		await I.seeLoading()
	},
)

export const KeepsLoadingWhenArticlesRequestNeverResolvesMobile = meta.story({
	name: 'Articles Request Loading State (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	beforeEach: KeepsLoadingWhenArticlesRequestNeverResolves.input.beforeEach,
})

KeepsLoadingWhenArticlesRequestNeverResolvesMobile.test(
	'[mobile] keeps loading state for pending articles request',
	async () => {
		await I.seeLoading()
	},
)
