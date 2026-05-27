import { reatomEnum, withSearchParams } from '@reatom/core'

export const sortFieldAtom = reatomEnum(['name', 'price'], 'items.sortField').extend(
	withSearchParams('sort'),
)

export const sortDirAtom = reatomEnum(['asc', 'desc'], 'items.sortDir').extend(
	withSearchParams('dir'),
)

export const categoryFilterAtom = reatomEnum(
	['all', 'electronics', 'furniture', 'clothing', 'food'],
	'items.categoryFilter',
).extend(withSearchParams('category'))

export const stockFilterAtom = reatomEnum(
	['all', 'in-stock', 'out-of-stock'],
	'items.stockFilter',
).extend(withSearchParams('stock'))
