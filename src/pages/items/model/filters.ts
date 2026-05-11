import { reatomEnum, withSearchParams } from '@reatom/core'

import { withCoerce } from '#shared/reatom'

export const sortFieldAtom = reatomEnum(['name', 'price'], 'items.sortField').extend(
	withCoerce('name'),
	withSearchParams('sort'),
)

export const sortDirAtom = reatomEnum(['asc', 'desc'], 'items.sortDir').extend(
	withCoerce('asc'),
	withSearchParams('dir'),
)

export const categoryFilterAtom = reatomEnum(
	['all', 'electronics', 'furniture', 'clothing', 'food'],
	'items.categoryFilter',
).extend(withCoerce('all'), withSearchParams('category'))

export const stockFilterAtom = reatomEnum(
	['all', 'in-stock', 'out-of-stock'],
	'items.stockFilter',
).extend(withCoerce('all'), withSearchParams('stock'))
