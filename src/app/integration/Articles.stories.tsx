import preview from '#.storybook/preview'
import { App } from '#app/App'
import { articleDetail, articleList } from '#entities/article/mocks/handlers'
import { articlesActor as I } from '#pages/articles/testing'
import { button, heading, link, role, text } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Articles',
	component: App,
	parameters: { layout: 'fullscreen', initialPath: 'articles' },
	loaders: [(ctx) => void I.init(ctx)],
})

export default meta

export const Default = meta.story({
	name: 'Default',
	play: () => I.waitExit(role('status')),
})

Default.test('renders article list with no selection message', async () => {
	await I.see(text('No article selected').within(role('main')))
	await I.seeArticleList()
	await I.seeStatusBadges()
})

Default.test('shows search toolbar with new article button', async () => {
	await I.seeSearchToolbar()
})

Default.test('shows article descriptions in list items', async () => {
	await I.seeArticleDescription(/Revenue overview and growth metrics/)
	await I.seeArticleDescription(/Engineering headcount proposal/)
})

Default.test('shows article detail when article is clicked', async () => {
	await I.click(link(/Quarterly report/i))
	await I.waitExit(role('status'))
	await I.seeArticleDetail('Quarterly report')
})

Default.test('shows all content paragraphs in article detail', async () => {
	await I.click(link(/Quarterly report/i))
	await I.waitExit(role('status'))

	await I.scope(role('main'), async () => {
		await I.see(heading('Quarterly report'))
		await I.see(text(/Regional performance remained strongest/))
		await I.see(text(/EMEA showed stable retention/))
		await I.see(text(/APAC growth accelerated/))
		await I.see(text(/Gross margin improved/))
		await I.see(text(/next planning cycle should prioritize/))
	})
})

Default.test('shows edit button and status badge in article detail', async () => {
	await I.click(link(/Quarterly report/i))
	await I.waitExit(role('status'))

	await I.scope(role('main'), async () => {
		await I.see(button('Edit'))
		await I.see(text('Done'))
	})
})

Default.test('shows article description in detail view', async () => {
	await I.click(link(/Quarterly report/i))
	await I.waitExit(role('status'))

	await I.scope(role('main'), async () => {
		await I.see(text('Revenue overview and growth metrics for Q3 across all regions.'))
	})
})

Default.test('can select different articles', async () => {
	await I.click(link(/Quarterly report/i))
	await I.waitExit(role('status'))
	await I.see(heading('Quarterly report'))

	await I.click(link(/Hiring plan/i))
	await I.waitExit(role('status'))
	await I.see(heading('Hiring plan'))
})

export const DirectUrlNavigation = meta.story({
	name: 'Direct URL to Article',
	parameters: { initialPath: 'articles/1' },
	play: () => I.waitExit(role('status')),
})

DirectUrlNavigation.test('loads article detail directly from URL', async () => {
	await I.seeArticleDetail('Quarterly report')

	await I.scope(role('main'), async () => {
		await I.see(text(/Regional performance remained strongest/))
	})
})

export const DirectUrlNavigationMobile = meta.story({
	name: 'Direct URL to Article (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: { initialPath: 'articles/1' },
	play: () => I.waitExit(role('status')),
})

DirectUrlNavigationMobile.test('[mobile] loads article detail directly from URL', async () => {
	await I.seeArticleDetail('Quarterly report')
})

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	play: () => I.waitExit(role('status')),
})

DefaultMobile.test('[mobile] shows article list when no article is selected', async () => {
	await I.seeArticleList()
})

DefaultMobile.test('[mobile] shows search toolbar with new article button', async () => {
	await I.seeSearchToolbar()
})

DefaultMobile.test('[mobile] shows article detail when article is clicked', async () => {
	await I.click(link(/Quarterly report/i))
	await I.waitExit(role('status'))
	await I.see(heading('Quarterly report'))
})

DefaultMobile.test('[mobile] shows all content paragraphs in article detail', async () => {
	await I.click(link(/Quarterly report/i))
	await I.waitExit(role('status'))

	await I.scope(role('main'), async () => {
		await I.see(heading('Quarterly report'))
		await I.see(text(/Regional performance remained strongest/))
		await I.see(text(/EMEA showed stable retention/))
		await I.see(text(/APAC growth accelerated/))
		await I.see(text(/Gross margin improved/))
		await I.see(text(/next planning cycle should prioritize/))
	})
})

DefaultMobile.test('[mobile] displays correct status badges for different statuses', async () => {
	await I.seeStatusBadges()
})

DefaultMobile.test('[mobile] can select different articles', async () => {
	await I.click(link(/Quarterly report/i))
	await I.waitExit(role('status'))
	await I.see(heading('Quarterly report'))

	await I.goBack()

	await I.click(link(/Hiring plan/i))
	await I.waitExit(role('status'))
	await I.see(heading('Hiring plan'))
})

export const HandlesArticlesLoadServerError = meta.story({
	name: 'Articles Load Server Error',
	parameters: {
		msw: {
			handlers: { articleList: articleList.error },
		},
	},
	play: () => I.waitExit(role('status')),
})

HandlesArticlesLoadServerError.test('shows error state when articles request fails', async () => {
	await I.seeError()
	await I.see(text("We couldn't load the article list. Try again in a moment."))
})

export const HandlesArticlesLoadServerErrorMobile = meta.story({
	name: 'Articles Load Server Error (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: HandlesArticlesLoadServerError.input.parameters,
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
	parameters: {
		msw: {
			handlers: { articleList: articleList.loading },
		},
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
	parameters: KeepsLoadingWhenArticlesRequestNeverResolves.input.parameters,
})

KeepsLoadingWhenArticlesRequestNeverResolvesMobile.test(
	'[mobile] keeps loading state for pending articles request',
	async () => {
		await I.seeLoading()
	},
)

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
		await I.click(link(/Quarterly report/i))
		await I.waitExit(role('status'))

		await I.scope(role('main'), async () => {
			await I.see(heading('Could not load articles'))
			await I.see(text("We couldn't load the article list. Try again in a moment."))
		})
	},
)

export const HandlesArticleDetailServerErrorMobile = meta.story({
	name: 'Article Detail Server Error (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: HandlesArticleDetailServerError.input.parameters,
	play: () => I.waitExit(role('status')),
})

HandlesArticleDetailServerErrorMobile.test(
	'[mobile] shows error state when article detail request fails',
	async () => {
		await I.click(link(/Quarterly report/i))
		await I.waitExit(role('status'))

		await I.scope(role('main'), async () => {
			await I.see(heading('Could not load articles'))
			await I.see(text("We couldn't load the article list. Try again in a moment."))
		})
	},
)

export const KeepsLoadingWhenArticleDetailNeverResolves = meta.story({
	name: 'Article Detail Loading State',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { articleDetail: articleDetail.loading },
		},
	},
})

KeepsLoadingWhenArticleDetailNeverResolves.test(
	'shows detail loading state while article detail is pending',
	async () => {
		await I.click(link(/Quarterly report/i))

		const detail = await I.see(role('main'))
		await I.see(role('status', 'Loading article detail').within(detail))
		await I.dontSee(heading('Quarterly report').within(detail))
		await I.dontSee(text('Article not found').within(detail))
	},
)

export const KeepsLoadingWhenArticleDetailNeverResolvesMobile = meta.story({
	name: 'Article Detail Loading State (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: KeepsLoadingWhenArticleDetailNeverResolves.input.parameters,
	play: () => I.waitExit(role('status')),
})

KeepsLoadingWhenArticleDetailNeverResolvesMobile.test(
	'[mobile] shows detail loading state while article detail is pending',
	async () => {
		await I.click(link(/Quarterly report/i))

		const detail = await I.see(role('main'))
		await I.see(role('status', 'Loading article detail').within(detail))
		await I.dontSee(heading('Quarterly report').within(detail))
		await I.dontSee(text('Article not found').within(detail))
	},
)
