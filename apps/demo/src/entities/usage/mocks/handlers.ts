import { HttpResponse, delay, http, type HttpResponseResolver } from 'msw'

import { USAGE_API_PATH } from '#entities/usage/api/usageApi'
import { usageMockData } from '#entities/usage/mocks/data'
import { composeApiUrl } from '#shared/api'
import { neverResolve, to500, withRetrySuccess } from '#shared/mocks/utils'

const url = composeApiUrl(USAGE_API_PATH)

const usageResolver = (async () => {
	await delay()

	return HttpResponse.json(usageMockData)
}) satisfies HttpResponseResolver

export const usageStats = {
	default: http.get(url, usageResolver),
	error: http.get(url, () => to500()),
	retrySucceeds: () => http.get(url, withRetrySuccess(usageResolver)),
	loading: http.get(url, neverResolve),
}

export const usageHandlers = [usageStats.default]
