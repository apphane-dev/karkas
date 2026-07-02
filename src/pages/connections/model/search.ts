import { atom, withSearchParams } from '@reatom/core'

import { createSearchParamsPath } from '#shared/router'

export const searchQueryAtom = atom('', 'connections.searchQuery').extend(
	withSearchParams('q', {
		path: createSearchParamsPath('connections'),
		replace: true,
		serialize: (value) => value || undefined,
	}),
)
