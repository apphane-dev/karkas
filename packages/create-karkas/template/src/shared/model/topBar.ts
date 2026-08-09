import { atom, withLocalStorage } from '@reatom/core'

export const showLanguageSwitcherInTopBarAtom = atom(true, 'showLanguageSwitcherInTopBar').extend(
	withLocalStorage('showLanguageSwitcherInTopBar'),
)

export const showGithubLinkInTopBarAtom = atom(true, 'showGithubLinkInTopBar').extend(
	withLocalStorage('showGithubLinkInTopBar'),
)

export const showThemeSwitcherInTopBarAtom = atom(true, 'showThemeSwitcherInTopBar').extend(
	withLocalStorage('showThemeSwitcherInTopBar'),
)
