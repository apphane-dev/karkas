import { assert } from '@reatom/core'
import { HttpResponse, delay, http, type HttpResponseResolver } from 'msw'

import { connectionsMockData } from '#entities/connection/mocks/data'
import { composeApiUrl } from '#shared/api'
import { Error404 } from '#shared/mocks'
import { neverResolve, to500, withRetrySuccess } from '#shared/mocks/utils'

import { CONNECTIONS_API_PATH } from '../api/connectionsApi'

const listUrl = composeApiUrl(CONNECTIONS_API_PATH)
const detailUrl = composeApiUrl(`${CONNECTIONS_API_PATH}/:connectionId`)

const connectionListResolver = (async () => {
	await delay()

	return HttpResponse.json(connectionsMockData.map(({ details: _, ...rest }) => rest))
}) satisfies HttpResponseResolver

const connectionDetailResolver = (async ({ params }) => {
	await delay()

	const connectionId = params['connectionId']
	const connection = connectionsMockData.find(({ id }) => id === connectionId)
	assert(connection, `Connection with id ${connectionId} not found in mock data`, Error404)

	return HttpResponse.json(connection)
}) satisfies HttpResponseResolver

export const connectionList = {
	default: http.get(listUrl, connectionListResolver),
	error: http.get(listUrl, () => to500()),
	retrySucceeds: () => http.get(listUrl, withRetrySuccess(connectionListResolver)),
	loading: http.get(listUrl, neverResolve),
}

export const connectionDetail = {
	default: http.get(detailUrl, connectionDetailResolver),
	error: http.get(detailUrl, () => to500()),
	retrySucceeds: () => http.get(detailUrl, withRetrySuccess(connectionDetailResolver)),
	loading: http.get(detailUrl, neverResolve),
}

export const connectionHandlers = [connectionList.default, connectionDetail.default]
