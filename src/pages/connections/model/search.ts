import { atom, withSearchParams } from '@reatom/core'

export const searchQueryAtom = atom('', 'connections.searchQuery').extend(
	withSearchParams('q', {
		path: '/connections/*',
		replace: true,
		serialize: (value) => value || undefined,
	}),
)
