import { expect } from 'storybook/test'

import preview from '#.storybook/preview'
import { App } from '#app/App'
import { ITEMS_API_PATH } from '#entities/item/api/itemsApi'
import { itemDetail, itemList } from '#entities/item/mocks/handlers'
import { itemsActor as I } from '#pages/items/testing'
import { link, role, text } from '#shared/test'
import {
	createRouteFetchAbortProbe,
	expectRouteFetchAbortOnNavigation,
	routeFetchAbortLifecycle,
} from '#shared/test/routeFetchAbortProbe'

const itemsFetchAbortProbe = createRouteFetchAbortProbe(ITEMS_API_PATH, 'items')
const itemDetailFetchAbortProbe = createRouteFetchAbortProbe(`${ITEMS_API_PATH}/1`, 'item detail')

const meta = preview.meta({
	title: 'Integration/Items',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'items',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

const itemListRetryHandler = itemList.retrySucceeds()
const itemDetailRetryHandler = itemDetail.retrySucceeds()

export const Default = meta.story({
	name: 'Default',
	play: () => I.waitExit(role('status')),
})

Default.test('renders items list', async () => {
	await I.seeItemsList()
})

Default.test('shows category badges', async () => {
	await I.seeCategoryBadges()
})

Default.test('shows Out of Stock badge', async () => {
	await I.seeOutOfStockBadge()
})

Default.test('shows item detail when an item is clicked', async () => {
	await I.click(text('Wireless Headphones'))
	await I.waitExit(role('status'))
	await I.seeItemDetail('Wireless Headphones')
})

export const DirectUrlNavigation = meta.story({
	name: 'Direct URL to Item',
	parameters: { initialPath: 'items/1' },
	play: () => I.waitExit(role('status')),
})

DirectUrlNavigation.test('loads item detail directly from URL', async () => {
	await I.seeItemDetail('Wireless Headphones')
})

export const DirectUrlNotFound = meta.story({
	name: 'Direct URL to Missing Item',
	parameters: { initialPath: 'items/missing-42' },
	play: () => I.waitExit(role('status')),
})

DirectUrlNotFound.test('shows not-found state for missing item URL', async () => {
	await I.seeItemNotFound('missing-42')
})

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	play: () => I.waitExit(role('status')),
})

export const AbortsPendingItemsRequestOnNavigation = meta.story({
	name: 'Aborts Pending Items Request On Navigation',

	beforeEach({ msw }) {
		msw.use(itemList.loading)
		return routeFetchAbortLifecycle(itemsFetchAbortProbe)()
	},
})

AbortsPendingItemsRequestOnNavigation.test(
	'aborts the pending items request when navigating away',
	async () => {
		await expectRouteFetchAbortOnNavigation(itemsFetchAbortProbe, () => I.click(link('Timer')), {
			assertLoading: () => I.seeLoading(),
		})
	},
)

DefaultMobile.test('[mobile] renders items list', async () => {
	await I.seeItemsList()
})

DefaultMobile.test('[mobile] shows category badges', async () => {
	await I.seeCategoryBadges()
})

export const AbortsPendingItemDetailRequestOnNavigation = meta.story({
	name: 'Aborts Pending Item Detail Request On Navigation',
	beforeEach({ msw }) {
		msw.use(itemDetail.loading)
		return routeFetchAbortLifecycle(itemDetailFetchAbortProbe)()
	},
	parameters: {
		initialPath: 'items/1',
	},
})

AbortsPendingItemDetailRequestOnNavigation.test(
	'aborts the pending item detail request when navigating away',
	async () => {
		await expectRouteFetchAbortOnNavigation(
			itemDetailFetchAbortProbe,
			() => I.click(link('Timer')),
			{
				assertLoading: async () => {
					await I.waitExit(role('status', 'Loading items page'))
					await I.see(role('status', 'Loading item detail'))
				},
			},
		)
	},
)

export const HandlesItemsLoadServerError = meta.story({
	name: 'Items Load Server Error',
	play: () => I.waitExit(role('status')),

	beforeEach({ msw }) {
		msw.use(itemList.error)
	},
})

HandlesItemsLoadServerError.test('shows error state when items request fails', async () => {
	await I.seeError()
	await I.see(text("We couldn't load the items. Try again in a moment."))
})

export const RecoversAfterItemsLoadRetry = meta.story({
	name: 'Items Load Retry Success',
	play: () => I.waitExit(role('status')),

	beforeEach({ msw }) {
		msw.use(itemListRetryHandler)
	},
})

RecoversAfterItemsLoadRetry.test('loads items after retry succeeds', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.see(text('Wireless Headphones').wait())
	await I.seeItemsList()
})

HandlesItemsLoadServerError.test('keeps error state when retry also fails', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.seeError()
})

export const HandlesItemsLoadServerErrorMobile = meta.story({
	name: 'Items Load Server Error (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	beforeEach: HandlesItemsLoadServerError.input.beforeEach,
	play: () => I.waitExit(role('status')),
})

HandlesItemsLoadServerErrorMobile.test(
	'[mobile] shows error state when items request fails',
	async () => {
		await I.seeError()
		await I.see(text("We couldn't load the items. Try again in a moment."))
	},
)

export const HandlesItemDetailServerError = meta.story({
	name: 'Item Detail Server Error',

	beforeEach({ msw }) {
		msw.use(itemDetail.error)
	},

	parameters: {
		initialPath: 'items/1',
	},

	play: () => I.waitExit(role('status')),
})

HandlesItemDetailServerError.test('shows error state when item detail request fails', async () => {
	await I.seeDetailError()
})

HandlesItemDetailServerError.test('keeps detail error state when retry also fails', async () => {
	await I.seeDetailError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.seeDetailError()
})

export const RecoversAfterItemDetailRetry = meta.story({
	name: 'Item Detail Retry Success',

	beforeEach({ msw }) {
		msw.use(itemDetailRetryHandler)
	},

	parameters: {
		initialPath: 'items/1',
	},

	play: () => I.waitExit(role('status')),
})

RecoversAfterItemDetailRetry.test('loads item detail after retry succeeds', async () => {
	await I.seeDetailError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.see(role('heading', 'Wireless Headphones').wait())
	await I.seeItemDetail('Wireless Headphones')
})

export const KeepsLoadingWhenItemDetailNeverResolves = meta.story({
	name: 'Item Detail Loading State',

	beforeEach({ msw }) {
		msw.use(itemDetail.loading)
	},

	parameters: {
		initialPath: 'items/1',
	},
})

KeepsLoadingWhenItemDetailNeverResolves.test(
	'shows detail loading state while item detail is pending',
	async () => {
		await I.waitExit(role('status', 'Loading items page'))
		await I.see(role('status', 'Loading item detail'))
		await I.dontSee(text('Item not found'))
	},
)

export const KeepsLoadingWhenItemsRequestNeverResolves = meta.story({
	name: 'Items Request Loading State',

	beforeEach({ msw }) {
		msw.use(itemList.loading)
	},
})

KeepsLoadingWhenItemsRequestNeverResolves.test(
	'keeps loading state for pending items request',
	async () => {
		await I.seeLoading()
	},
)

export const KeepsLoadingWhenItemsRequestNeverResolvesMobile = meta.story({
	name: 'Items Request Loading State (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	beforeEach: KeepsLoadingWhenItemsRequestNeverResolves.input.beforeEach,
})

KeepsLoadingWhenItemsRequestNeverResolvesMobile.test(
	'[mobile] keeps loading state for pending items request',
	async () => {
		await I.seeLoading()
	},
)

export const FilteredByCategory = meta.story({
	name: 'Filtered by Category',
	play: () => I.waitExit(role('status')),
})

FilteredByCategory.test('shows only electronics items', async () => {
	await I.applyCategoryFilter('Electronics')
	await I.seeItems('Wireless Headphones', 'Mechanical Keyboard')
	await I.dontSeeItem('Standing Desk')
	await I.dontSeeItem('Merino Wool Sweater')
})

FilteredByCategory.test('shows only food items', async () => {
	await I.applyCategoryFilter('Food')
	await I.seeItems('Organic Coffee Beans')
	await I.dontSeeItem('Wireless Headphones')
})

FilteredByCategory.test('item availability changes with category filter', async () => {
	expect(await I.tryTo(() => I.seeItem('Wireless Headphones'))).toBe(true)
	expect(await I.tryTo(() => I.seeItem('Non-existent Product'))).toBe(false)

	await I.applyCategoryFilter('Food')
	expect(await I.tryTo(() => I.seeItem('Wireless Headphones'))).toBe(false)
	expect(await I.tryTo(() => I.seeItem('Organic Coffee Beans'))).toBe(true)
})

export const FilteredByStock = meta.story({
	name: 'Filtered by Stock',
	play: () => I.waitExit(role('status')),
})

FilteredByStock.test('shows only in-stock items', async () => {
	await I.applyStockFilter('In Stock')
	await I.seeItems('Wireless Headphones', 'Standing Desk')
	await I.dontSeeItem('Merino Wool Sweater')
})

FilteredByStock.test('shows only out-of-stock items', async () => {
	await I.applyStockFilter('Out of Stock')
	await I.seeItems('Merino Wool Sweater', 'Ergonomic Chair')
	await I.dontSeeItem('Wireless Headphones')
})

export const FilteredToEmpty = meta.story({
	name: 'No Matching Items',
	play: () => I.waitExit(role('status')),
})

FilteredToEmpty.test('shows empty state message', async () => {
	await I.applyCategoryFilter('Electronics')
	await I.applyStockFilter('Out of Stock')
	await I.see(text('No items match the current filters.'))
})

FilteredToEmpty.test('updates visible items across filter states', async () => {
	await I.seeItem('Wireless Headphones')
	await I.seeItem('Standing Desk')

	await I.applyCategoryFilter('Electronics')
	await I.applyStockFilter('Out of Stock')

	expect(await I.tryTo(() => I.seeItem('Wireless Headphones'))).toBe(false)
	await I.see(text('No items match the current filters.'))
})

export const SortedByPrice = meta.story({
	name: 'Sorted by Price',
	play: () => I.waitExit(role('status')),
})

SortedByPrice.test('sorts ascending by default', async () => {
	await I.applyPriceSort()
	const prices = await I.grabVisiblePrices()
	const sortedPrices = [...prices].sort((a, b) => a - b)
	expect(prices).toEqual(sortedPrices)
})

SortedByPrice.test('sorts descending after toggle', async () => {
	await I.applyPriceSort()
	await I.toggleSortDirection()
	const prices = await I.grabVisiblePrices()
	const sortedPrices = [...prices].sort((a, b) => b - a)
	expect(prices).toEqual(sortedPrices)
})
