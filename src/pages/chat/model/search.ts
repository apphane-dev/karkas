import { atom, withSearchParams } from '@reatom/core'

export const searchQueryAtom = atom('', 'chat.searchQuery').extend(
	withSearchParams('q', {
		path: '/chat/*',
		replace: true,
		serialize: (value) => value || undefined,
	}),
)
