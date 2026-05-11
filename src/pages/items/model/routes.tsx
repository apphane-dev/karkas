import { retryComputed, wrap } from '@reatom/core'

import { fetchItems, fetchItemById } from '#entities/item'
import { m } from '#paraglide/messages.js'
import { isApiError } from '#shared/api'
import { rootRoute } from '#shared/router'
import { PageError } from '#widgets/data-page'

import { ItemDetail } from '../ui/detail/ItemDetail'
import { ItemDetailLoadingState } from '../ui/detail/ItemDetailLoadingState'
import { ItemNotFound } from '../ui/detail/ItemNotFound'
import { ItemsPage } from '../ui/ItemsPage'
import { ItemsPageLoading } from '../ui/ItemsPageLoading'

export const itemsRoute = rootRoute.reatomRoute(
	{
		path: 'items',
		loader: fetchItems,
		render: (self) => {
			const { isFirstPending, isPending, data: items } = self.loader.status()
			if (isFirstPending || (isPending && !items)) {
				return <ItemsPageLoading />
			}
			if (!items) {
				return (
					<PageError
						title={m.items_error_title()}
						description={m.items_error_description()}
						onRetry={wrap(() => retryComputed(self.loader))}
					/>
				)
			}
			// If a child route is active (e.g. /items/:id), render it full page
			if (itemDetailRoute()) {
				return self.outlet().at(0) ?? <ItemNotFound itemId={itemDetailRoute()?.itemId ?? ''} />
			}
			// Otherwise render the full-width list
			return (
				<ItemsPage
					items={items.map((item) => ({
						item,
						href: itemDetailRoute.path({ itemId: item.id }),
					}))}
				/>
			)
		},
	},
	'items',
)

export const itemDetailRoute = itemsRoute.reatomRoute(
	{
		path: ':itemId',
		loader: ({ itemId }) => fetchItemById(itemId),
		render: (self) => {
			const { isPending, data: item } = self.loader.status()
			const error = self.loader.error()
			if (isPending) return <ItemDetailLoadingState />
			if (error && !(isApiError(error) && error.status === 404)) {
				return (
					<PageError
						title={m.items_error_title()}
						description={m.items_error_description()}
						onRetry={wrap(() => retryComputed(self.loader))}
					/>
				)
			}
			return item ? <ItemDetail item={item} /> : <ItemNotFound itemId={self().itemId} />
		},
	},
	'itemDetail',
)
