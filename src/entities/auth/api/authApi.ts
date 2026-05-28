import type { AuthSession, LoginCredentials } from '#entities/auth/model/types'

import { apiClient } from '#shared/api'

export const AUTH_LOGIN_API_PATH = '/auth/login'
export const AUTH_LOGOUT_API_PATH = '/auth/logout'

export async function login(credentials: LoginCredentials) {
	return apiClient.post<AuthSession>(AUTH_LOGIN_API_PATH, { body: credentials })
}

export async function logout() {
	await apiClient.post<null>(AUTH_LOGOUT_API_PATH)
}
