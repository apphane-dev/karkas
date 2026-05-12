import { expect } from 'storybook/test'

import preview from '#.storybook/preview'
import { itemsMockData } from '#entities/item/mocks/data'
import { createActor, heading, role, text } from '#shared/test'

import { ItemsPage } from './ItemsPage'

const I = createActor().extend((targetI) => ({
	checkPrices: async () => {
		const priceElements = await targetI.resolveLocator(text(/^\$/).all())
		if (!Array.isArray(priceElements)) {
			throw new Error('Expected price locator to resolve to an array of elements')
		}
		return priceElements.map((el) => Number((el.textContent ?? '').replace('$', '')))
	},
	seeItem: async (name: string) => {
		await targetI.see(text(name))
	},
	dontSeeItem: async (name: string) => {
		await targetI.dontSee(text(name))
	},
	selectSort: async (option: string) => {
		await targetI.selectOption(role('combobox', /Sort by/i), option)
	},
	selectCategory: async (option: string) => {
		await targetI.selectOption(role('combobox', /Category/i), option)
	},
	selectStock: async (option: string) => {
		await targetI.selectOption(role('combobox', /Stock/i), option)
	},
	toggleSortDirection: async () => {
		await targetI.click(role('button', /Asc|Desc/))
	},
}))

const meta = preview.meta({
	title: 'Pages/Items',
	component: ItemsPage,
	args: {
		items: itemsMockData.map((item) => ({ item, href: `/items/${item.id}` })),
	},
	parameters: { layout: 'fullscreen' },
	loaders: [(ctx) => void I.init(ctx)],
})

export default meta

export const Default = meta.story({ name: 'Default' })

Default.test('renders items list', async () => {
	await I.see(heading('Items'))
	await I.seeItem('Wireless Headphones')
	await I.seeItem('Standing Desk')
})

Default.test('filters by category: Electronics', async () => {
	await I.selectCategory('Electronics')
	await I.seeItem('Wireless Headphones')
	await I.seeItem('Mechanical Keyboard')
	await I.dontSeeItem('Standing Desk')
	await I.dontSeeItem('Merino Wool Sweater')
})

Default.test('filters by stock: In Stock', async () => {
	await I.selectStock('In Stock')
	await I.seeItem('Wireless Headphones')
	await I.seeItem('Standing Desk')
	await I.dontSeeItem('Merino Wool Sweater') // Sweater is Out of Stock
})

Default.test('filters by stock: Out of Stock', async () => {
	await I.selectStock('Out of Stock')
	await I.seeItem('Merino Wool Sweater')
	await I.seeItem('Ergonomic Chair')
	await I.dontSeeItem('Wireless Headphones') // Headphones are In Stock
})

Default.test('sorts by price: Ascending', async () => {
	await I.selectSort('Price')
	// Default is Ascending
	const prices = await I.checkPrices()
	const sortedPrices = [...prices].sort((a, b) => a - b)
	expect(prices).toEqual(sortedPrices)
})

Default.test('sorts by price: Descending', async () => {
	await I.selectSort('Price')
	await I.toggleSortDirection()
	const prices = await I.checkPrices()
	const sortedPrices = [...prices].sort((a, b) => b - a)
	expect(prices).toEqual(sortedPrices)
})

Default.test('shows no items message when filters match nothing', async () => {
	// Electronics + Out of Stock = 0 results in mock data
	await I.selectCategory('Electronics')
	await I.selectStock('Out of Stock')
	await I.see(text('No items match the current filters.'))
})
