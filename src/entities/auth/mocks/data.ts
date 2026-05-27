import type { AuthSession } from '#entities/auth/model/types'

export const authMockSession = {
	token: 'mock-session-token',
	user: {
		id: 'user-1',
		name: 'Alex Morgan',
		email: 'alex@example.com',
	},
} satisfies AuthSession
