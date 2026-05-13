import { expect } from 'storybook/test'

import preview from '#.storybook/preview'
import { articlesMockData } from '#entities/article/mocks/data'
import { m } from '#paraglide/messages.js'
import { button, createActor, link, role, text } from '#shared/test'

import { ArticleList } from './ArticleList'

const I = createActor()

const articles = articlesMockData.map((article) => ({
	article,
	href: `/articles/${article.id}`,
}))

const meta = preview.meta({
	title: 'Pages/Articles/ArticleList',
	component: ArticleList,
	args: {
		articles,
		selectedId: undefined,
	},
	parameters: { layout: 'padded' },
	loaders: [(ctx) => void I.init(ctx)],
})

export default meta

export const Default = meta.story({ name: 'Default' })

Default.test('renders all articles with correct titles', async () => {
	await I.seeNumberOfElements(role('listitem').all(), 20)

	await I.scope(role('list', 'Articles'), async () => {
		await I.see(link(/Quarterly report/i))
		await I.see(link(/Hiring plan/i))
		await I.see(link(/Roadmap draft/i))
		await I.see(link(/Security audit/i))
		await I.see(link(/Design system update/i))

		const titles = await I.grabTextFromAll(link().all())
		expect(titles).toHaveLength(20)
		expect(titles[0]).toContain('Quarterly report')
	})
})

Default.test('renders toolbar with search, filters, and new article button', async () => {
	await I.see((canvas) => canvas.getByPlaceholderText(m.article_search_placeholder()))
	await I.see(button('Filters'))
	await I.see(button('New article'))
})

Default.test('displays status badges across articles', async () => {
	await I.see(text('Done').all())
	await I.see(text('In Progress').all())
	await I.see(text('Draft').all())
})

Default.test('displays article descriptions', async () => {
	await I.see(text(/Revenue overview and growth metrics/))
	await I.see(text(/Engineering headcount proposal/))
})

Default.test('article exists only when present in list', async () => {
	expect(await I.tryTo(() => I.see(link(/Quarterly report/i)))).toBe(true)
	expect(await I.tryTo(() => I.see(link(/Non-existent Article/i)))).toBe(false)
})

export const WithSelection = meta.story({
	name: 'With Selection',
	args: {
		articles,
		selectedId: '1',
	},
})

WithSelection.test('highlights selected article', async () => {
	await I.see(link(/Quarterly report/i).options({ current: 'page' }))
	await I.dontSee(link(/Hiring plan/i).options({ current: 'page' }))
})
