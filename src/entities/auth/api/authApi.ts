import type { AuthSession, LoginCredentials } from '#entities/auth/model/types'

import { apiClient } from '#shared/api'

export const AUTH_LOGIN_API_PATH = '/auth/login'
export const AUTH_LOGOUT_API_PATH = '/auth/logout'
export const AUTH_ME_API_PATH = '/auth/me'

export async function login(credentials: LoginCredentials) {
	return apiClient.post<AuthSession>(AUTH_LOGIN_API_PATH, { body: credentials })
}

export async function logout() {
	await apiClient.post<null>(AUTH_LOGOUT_API_PATH)
}

export async function fetchSession(token: string) {
	return apiClient.get<AuthSession>(AUTH_ME_API_PATH, {
		headers: { Authorization: `Bearer ${token}` },
	})
}
