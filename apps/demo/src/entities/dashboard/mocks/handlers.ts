import { HttpResponse, delay, http, type HttpResponseResolver } from 'msw'

import { DASHBOARD_API_PATH } from '#entities/dashboard/api/dashboardApi'
import { dashboardMockData } from '#entities/dashboard/mocks/data'
import { composeApiUrl } from '#shared/api'
import { neverResolve, to500, withRetrySuccess } from '#shared/mocks/utils'

const url = composeApiUrl(DASHBOARD_API_PATH)

const dashboardStatsResolver = (async () => {
	await delay()

	return HttpResponse.json(dashboardMockData)
}) satisfies HttpResponseResolver

export const dashboardStats = {
	default: http.get(url, dashboardStatsResolver),
	error: http.get(url, () => to500()),
	retrySucceeds: () => http.get(url, withRetrySuccess(dashboardStatsResolver)),
	loading: http.get(url, neverResolve),
}

export const dashboardHandlers = [dashboardStats.default]
