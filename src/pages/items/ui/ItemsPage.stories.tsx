import { expect } from 'storybook/test'

import preview from '#.storybook/preview'
import { itemsMockData } from '#entities/item/mocks/data'
import { createActor, heading, role, text } from '#shared/test'

import { ItemsPage } from './ItemsPage'

const I = createActor().extend((targetI) => ({
	checkPrices: async () => {
		const prices = await targetI.grabTextFromAll(text(/^\$/).all())
		return prices.map((price) => Number(price.replace('$', '')))
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
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({ name: 'Default' })

Default.test('renders page heading and sample items', async () => {
	await I.see(heading('Items'))
	await I.seeNumberOfElements(role('link').all(), 12)
	await I.seeItem('Wireless Headphones')
	await I.seeItem('Standing Desk')
})

export const FilteredByCategory = meta.story({ name: 'Filtered by Category' })

FilteredByCategory.test('shows only electronics items', async () => {
	await I.selectCategory('Electronics')
	await I.seeNumberOfElements(role('link').all(), 3)
	await I.seeItem('Wireless Headphones')
	await I.seeItem('Mechanical Keyboard')
	await I.dontSeeItem('Standing Desk')
	await I.dontSeeItem('Merino Wool Sweater')
})

FilteredByCategory.test('shows only food items', async () => {
	await I.selectCategory('Food')
	await I.seeNumberOfElements(role('link').all(), 3)
	await I.seeItem('Organic Coffee Beans')
	await I.dontSeeItem('Wireless Headphones')
})

FilteredByCategory.test('item availability changes with category filter', async () => {
	expect(await I.tryTo(() => I.seeItem('Wireless Headphones'))).toBe(true)
	expect(await I.tryTo(() => I.seeItem('Non-existent Product'))).toBe(false)

	await I.selectCategory('Food')
	expect(await I.tryTo(() => I.seeItem('Wireless Headphones'))).toBe(false)
	expect(await I.tryTo(() => I.seeItem('Organic Coffee Beans'))).toBe(true)
})

export const FilteredByStock = meta.story({ name: 'Filtered by Stock' })

FilteredByStock.test('shows only in-stock items', async () => {
	await I.selectStock('In Stock')
	await I.seeItem('Wireless Headphones')
	await I.seeItem('Standing Desk')
	await I.dontSeeItem('Merino Wool Sweater')
})

FilteredByStock.test('shows only out-of-stock items', async () => {
	await I.selectStock('Out of Stock')
	await I.seeItem('Merino Wool Sweater')
	await I.seeItem('Ergonomic Chair')
	await I.dontSeeItem('Wireless Headphones')
})

export const FilteredToEmpty = meta.story({ name: 'No Matching Items' })

FilteredToEmpty.test('shows empty state message', async () => {
	await I.selectCategory('Electronics')
	await I.selectStock('Out of Stock')
	await I.see(text('No items match the current filters.'))
})

FilteredToEmpty.test('verifies multiple items across filter states', async () => {
	expect(await I.hopeThat(() => I.seeItem('Wireless Headphones'))).toBe(true)
	expect(await I.hopeThat(() => I.seeItem('Standing Desk'))).toBe(true)
	I.hopeThat.noErrors()

	await I.selectCategory('Electronics')
	await I.selectStock('Out of Stock')
	expect(await I.hopeThat(() => I.seeItem('Wireless Headphones'))).toBe(false)
	expect(() => I.hopeThat.noErrors()).toThrow(/soft assertion/)
})

export const SortedByPrice = meta.story({ name: 'Sorted by Price' })

SortedByPrice.test('sorts ascending by default', async () => {
	await I.selectSort('Price')
	const prices = await I.checkPrices()
	const sortedPrices = [...prices].sort((a, b) => a - b)
	expect(prices).toEqual(sortedPrices)
})

SortedByPrice.test('sorts descending after toggle', async () => {
	await I.selectSort('Price')
	await I.toggleSortDirection()
	const prices = await I.checkPrices()
	const sortedPrices = [...prices].sort((a, b) => b - a)
	expect(prices).toEqual(sortedPrices)
})
