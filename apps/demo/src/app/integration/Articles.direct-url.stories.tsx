import preview from '#.storybook/preview'
import { App } from '#app/App'
import { articlesActor as I } from '#pages/articles/testing'
import { role } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Articles/Direct URL',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'articles/1',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const DirectUrlNavigation = meta.story({
	name: 'Direct URL to Article',
	play: () => I.waitExit(role('status')),
})

DirectUrlNavigation.test('loads article detail directly from URL', async () => {
	await I.seeArticleDetail('Quarterly report')
	await I.seeArticleDetailContent()
})

export const DirectUrlNotFound = meta.story({
	name: 'Direct URL to Missing Article',
	parameters: { initialPath: 'articles/missing-42' },
	play: () => I.waitExit(role('status')),
})

DirectUrlNotFound.test('shows not-found state for missing article URL', async () => {
	await I.scope(role('main'), async () => {
		await I.seeArticleNotFound('missing-42')
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
