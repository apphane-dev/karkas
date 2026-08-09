import { atom, withSearchParams } from '@reatom/core'

import { createSearchParamsPath } from '#shared/router'

export const searchQueryAtom = atom('', 'chat.searchQuery').extend(
	withSearchParams('q', {
		path: createSearchParamsPath('chat'),
		replace: true,
		serialize: (value) => value || undefined,
	}),
)
