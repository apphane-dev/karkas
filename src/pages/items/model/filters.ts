import { reatomEnum, withSearchParams } from '@reatom/core'

import { createSearchParamsPath } from '#shared/router'

const itemSearchParam = { path: createSearchParamsPath('items'), replace: true } as const

export const sortFieldAtom = reatomEnum(['name', 'price'], 'items.sortField').extend(
	withSearchParams('sort', itemSearchParam),
)

export const sortDirAtom = reatomEnum(['asc', 'desc'], 'items.sortDir').extend(
	withSearchParams('dir', itemSearchParam),
)

export const categoryFilterAtom = reatomEnum(
	['all', 'electronics', 'furniture', 'clothing', 'food'],
	'items.categoryFilter',
).extend(withSearchParams('category', itemSearchParam))

export const stockFilterAtom = reatomEnum(
	['all', 'in-stock', 'out-of-stock'],
	'items.stockFilter',
).extend(withSearchParams('stock', itemSearchParam))
