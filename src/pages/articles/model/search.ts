import { atom, withSearchParams } from '@reatom/core'

export const searchQueryAtom = atom('', 'articles.searchQuery').extend(
	withSearchParams('q', {
		path: '/articles/*',
		replace: true,
		serialize: (value) => value || undefined,
	}),
)
