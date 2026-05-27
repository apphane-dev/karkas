import type { AuthSession, LoginCredentials } from './types'

import { action, atom, computed, wrap } from '@reatom/core'

import { fetchSession, login, logout } from '#entities/auth/api/authApi'

const AUTH_TOKEN_STORAGE_KEY = 'modern-stack.authToken'

const readStoredToken = () => {
	try {
		return globalThis.localStorage?.getItem(AUTH_TOKEN_STORAGE_KEY) ?? null
	} catch {
		return null
	}
}

const writeStoredToken = (token: string | null) => {
	try {
		if (token === null) {
			globalThis.localStorage?.removeItem(AUTH_TOKEN_STORAGE_KEY)
		} else {
			globalThis.localStorage?.setItem(AUTH_TOKEN_STORAGE_KEY, token)
		}
	} catch {
		// Storage can be unavailable in privacy modes; in-memory auth still works.
	}
}

const authTokenAtom = atom<string | null>(readStoredToken(), 'authTokenAtom')
export const authSessionAtom = atom<AuthSession | null>(null, 'authSessionAtom')
export const authErrorAtom = atom<string | null>(null, 'authErrorAtom')
export const authPendingAtom = atom(false, 'authPendingAtom')

export const isAuthenticatedAtom = computed(
	() => authTokenAtom() !== null || authSessionAtom() !== null,
	'isAuthenticatedAtom',
)

const setSession = (session: AuthSession | null) => {
	authSessionAtom.set(session)
	if (session === null) {
		authTokenAtom.set(null)
		writeStoredToken(null)
		return
	}
	authTokenAtom.set(session.token)
	writeStoredToken(session.token)
}

export const restoreSession = action(async () => {
	const token = authTokenAtom()
	if (!token || authSessionAtom()) return

	authPendingAtom.set(true)
	authErrorAtom.set(null)
	try {
		setSession(await wrap(fetchSession(token)))
	} catch {
		setSession(null)
	} finally {
		authPendingAtom.set(false)
	}
}, 'restoreSession')

export const loginAction = action(async (credentials: LoginCredentials) => {
	authPendingAtom.set(true)
	authErrorAtom.set(null)
	try {
		setSession(await wrap(login(credentials)))
		return true
	} catch (error) {
		authErrorAtom.set(error instanceof Error ? error.message : 'Unable to sign in')
		return false
	} finally {
		authPendingAtom.set(false)
	}
}, 'loginAction')

export const logoutAction = action(async () => {
	authPendingAtom.set(true)
	try {
		await wrap(logout())
	} finally {
		setSession(null)
		authPendingAtom.set(false)
	}
}, 'logoutAction')

export const setAuthenticatedForTest = action((session: AuthSession | null) => {
	authErrorAtom.set(null)
	authPendingAtom.set(false)
	setSession(session)
}, 'setAuthenticatedForTest')
