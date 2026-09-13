import type { RequestHandler } from 'msw'

import { authHandlers } from '#entities/auth/mocks/handlers'
import { dashboardStats } from '#entities/dashboard/mocks/handlers'
import { orgHandlers } from '#entities/org/mocks/handlers'

export const handlers = {
	authLogin: authHandlers.login,
	authLogout: authHandlers.logout,
	dashboardStats: dashboardStats.default,
	orgs: orgHandlers.orgs,
} satisfies Record<string, RequestHandler | RequestHandler[]>

export const handlersArray = Object.values(handlers).flat() satisfies RequestHandler[]
