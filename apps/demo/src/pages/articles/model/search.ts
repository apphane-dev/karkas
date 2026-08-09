import { atom, withSearchParams } from '@reatom/core'

import { createSearchParamsPath } from '#shared/router'

export const searchQueryAtom = atom('', 'articles.searchQuery').extend(
	withSearchParams('q', {
		path: createSearchParamsPath('articles'),
		replace: true,
		serialize: (value) => value || undefined,
	}),
)
