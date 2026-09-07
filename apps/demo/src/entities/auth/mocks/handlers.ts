import { HttpResponse, delay, http } from 'msw'

import { AUTH_LOGIN_API_PATH, AUTH_LOGOUT_API_PATH } from '#entities/auth/api/authApi'
import { composeApiUrl } from '#shared/api'
import { to400, to422, to500 } from '#shared/mocks/utils'

import { authMockSession } from './data'

const loginUrl = composeApiUrl(AUTH_LOGIN_API_PATH)
const logoutUrl = composeApiUrl(AUTH_LOGOUT_API_PATH)

export const authHandlers = {
	login: http.post(loginUrl, async ({ request }) => {
		await delay()
		const body = (await request.json()) as { email?: string; password?: string }
		// A server-side uniqueness check is the one credential rule the client
		// cannot pre-validate — it demonstrates a validation error that maps
		// onto a form field.
		if (body.email === 'taken@example.com') {
			to422([{ loc: ['body', 'email'], msg: 'This email is already registered' }])
		}
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
	logoutError: http.post(logoutUrl, () => to500()),
}
