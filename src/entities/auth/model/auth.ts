import type { AuthSession, LoginCredentials } from './types'

import {
	action,
	atom,
	computed,
	wrap,
	withAsync,
	withLocalStorage,
	framePromise,
	log,
} from '@reatom/core'

import { login, logout } from '#entities/auth/api/authApi'

export const authSessionAtom = atom<AuthSession | null>(null, 'authSession').extend(
	withLocalStorage('modern-stack.authSession'),
)

export const isAuthenticatedAtom = computed(() => authSessionAtom() !== null, 'isAuthenticated')

export const loginAction = action(async (credentials: LoginCredentials) => {
	authSessionAtom.set(await wrap(login(credentials)))
}, 'loginAction').extend(withAsync())

export const logoutAction = action(async () => {
	framePromise().catch(
		wrap(() => {
			log('Logout failed, but we will clear the session anyway')
		}),
	)
	authSessionAtom.set(null)
	await wrap(logout())
}, 'logoutAction')
