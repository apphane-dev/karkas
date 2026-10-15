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
	.extend((I) => {
		const selectFilterOption = async (name: RegExp, option: string) => {
			const trigger = role('combobox', name)
			await I.selectOption(trigger, option)
			// Ark 5.39 keeps the popup open after selection. Close it before the next control.
			await I.click(trigger)
			await I.retryTo(() => I.seeAttribute(trigger, 'aria-expanded', 'false'), 10)
		}

		return {
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
			applyCategoryFilter: (option: string) => selectFilterOption(/Category/i, option),
			applyStockFilter: (option: string) => selectFilterOption(/Stock/i, option),
			applyPriceSort: () => selectFilterOption(/Sort by/i, 'Price'),
			toggleSortDirection: async () => {
				await I.click(role('button', /Asc|Desc/))
			},
			grabVisiblePrices: async () => {
				const prices = await I.grabTextFromAll(text(/^\$/).all())
				return prices.map((price) => Number(price.replace('$', '')))
			},
		}
	})
