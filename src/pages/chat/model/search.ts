import { atom, withSearchParams } from '@reatom/core'

export const searchQueryAtom = atom('', 'chat.searchQuery').extend(withSearchParams('q'))
