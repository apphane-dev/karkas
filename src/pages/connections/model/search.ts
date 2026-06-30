import { atom, withSearchParams } from '@reatom/core'

export const searchQueryAtom = atom('', 'connections.searchQuery').extend(withSearchParams('q'))
