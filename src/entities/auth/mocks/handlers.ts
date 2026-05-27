import { HttpResponse, delay, http } from 'msw'

import {
	AUTH_LOGIN_API_PATH,
	AUTH_LOGOUT_API_PATH,
	AUTH_ME_API_PATH,
} from '#entities/auth/api/authApi'
import { composeApiUrl } from '#shared/api'
import { to400, to500 } from '#shared/mocks/utils'

import { authMockSession } from './data'

const loginUrl = composeApiUrl(AUTH_LOGIN_API_PATH)
const logoutUrl = composeApiUrl(AUTH_LOGOUT_API_PATH)
const meUrl = composeApiUrl(AUTH_ME_API_PATH)

export const authHandlers = {
	login: http.post(loginUrl, async ({ request }) => {
		await delay()
		const body = (await request.json()) as { email?: string; password?: string }
		if (body.email !== authMockSession.user.email || body.password !== 'password') {
			return to400('Invalid email or password')
		}
		return HttpResponse.json(authMockSession)
	}),
	loginError: http.post(loginUrl, () => to500()),
	logout: http.post(logoutUrl, async () => {
		await delay()
		return new HttpResponse(null, { status: 204 })
	}),
	me: http.get(meUrl, async ({ request }) => {
		await delay()
		const authorization = request.headers.get('Authorization')
		if (authorization !== `Bearer ${authMockSession.token}`) {
			return to400('Invalid session')
		}
		return HttpResponse.json(authMockSession)
	}),
}
