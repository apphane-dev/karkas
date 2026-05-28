import {
	createActor,
	heading,
	role,
	text,
	withDetailError,
	withPageError,
	withRetryAndLoading,
} from '#shared/test'

export const itemsActor = createActor()
	.extend(withRetryAndLoading('Loading items page'))
	.extend(
		withPageError({
			title: 'Could not load items',
			description: "We couldn't load the items. Try again in a moment.",
		}),
	)
	.extend(
		withDetailError({
			title: 'Could not load item',
			description: "We couldn't load this item. Try again in a moment.",
		}),
	)
	.extend((I) => ({
		seeItemDetail: async (name: string) => {
			await I.see(heading(name))
			await I.see(text('Price'))
			await I.see(text('Category'))
			await I.see(text('Stock'))
		},
		seeItemNotFound: async (itemId: string) => {
			await I.see(heading('Item not found'))
			await I.see(text(`Item "${itemId}" was not found.`))
		},
		seeItemsList: async () => {
			await I.see(text('Wireless Headphones'))
			await I.see(text('Standing Desk'))
			await I.see(text('Mechanical Keyboard'))
		},
		seeCategoryBadges: async () => {
			await I.see(text('Electronics').all())
			await I.see(text('Furniture').all())
		},
		seeOutOfStockBadge: async () => {
			await I.see(text('Out of Stock').all())
		},
		seeItem: async (name: string) => {
			await I.see(text(name))
		},
		dontSeeItem: async (name: string) => {
			await I.dontSee(text(name))
		},
		seeItems: async (...names: string[]) => {
			for (const name of names) {
				await I.see(text(name))
			}
		},
		applyCategoryFilter: async (option: string) => {
			await I.selectOption(role('combobox', /Category/i), option)
		},
		applyStockFilter: async (option: string) => {
			await I.selectOption(role('combobox', /Stock/i), option)
		},
		applyPriceSort: async () => {
			await I.selectOption(role('combobox', /Sort by/i), 'Price')
		},
		toggleSortDirection: async () => {
			await I.click(role('button', /Asc|Desc/))
		},
		grabVisiblePrices: async () => {
			const prices = await I.grabTextFromAll(text(/^\$/).all())
			return prices.map((price) => Number(price.replace('$', '')))
		},
	}))
