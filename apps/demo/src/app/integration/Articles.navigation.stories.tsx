import { assertNoRouteLoaderAbortErrors } from '#.storybook/abortErrorGuard'
import preview from '#.storybook/preview'
import { App } from '#app/App'
import { articlesActor as I } from '#pages/articles/testing'
import { role } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Articles/Navigation',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'articles',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const SwitchBetweenArticles = meta.story({
	name: 'Switch Between Articles',
	play: () => I.waitExit(role('status')),
})

SwitchBetweenArticles.test('can switch from one article detail to another', async () => {
	await I.openArticle(/Quarterly report/i)
	await I.seeArticleDetail('Quarterly report')

	await I.openArticle(/Hiring plan/i)
	await I.seeArticleDetail('Hiring plan')
})

export const SwitchBetweenArticlesMobile = meta.story({
	name: 'Switch Between Articles (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	play: () => I.waitExit(role('status')),
})

SwitchBetweenArticlesMobile.test(
	'[mobile] can switch to another article after navigating back',
	async () => {
		await I.openArticle(/Quarterly report/i)
		await I.seeArticleDetail('Quarterly report')

		await I.goBack()
		await I.see(role('list', 'Articles').wait())
		await assertNoRouteLoaderAbortErrors('articleDetail')

		await I.openArticle(/Hiring plan/i)
		await I.seeArticleDetail('Hiring plan')
	},
)
