import { assert } from '@reatom/core'
import { HttpResponse, delay, http, type HttpResponseResolver } from 'msw'

import { itemsMockData } from '#entities/item/mocks/data'
import { composeApiUrl } from '#shared/api'
import { Error404 } from '#shared/mocks'
import { neverResolve, to500, withRetrySuccess } from '#shared/mocks/utils'

import { ITEMS_API_PATH } from '../api/itemsApi'

const listUrl = composeApiUrl(ITEMS_API_PATH)
const detailUrl = composeApiUrl(`${ITEMS_API_PATH}/:itemId`)

const itemListResolver = (async () => {
	await delay()

	return HttpResponse.json(itemsMockData)
}) satisfies HttpResponseResolver

const itemDetailResolver = (async ({ params }) => {
	await delay()

	const itemId = params['itemId']
	const item = itemsMockData.find((item) => item.id === itemId)
	assert(item, `Item with id ${itemId} not found in mock data`, Error404)

	return HttpResponse.json(item)
}) satisfies HttpResponseResolver

export const itemList = {
	default: http.get(listUrl, itemListResolver),
	error: http.get(listUrl, () => to500()),
	retrySucceeds: () => http.get(listUrl, withRetrySuccess(itemListResolver)),
	loading: http.get(listUrl, neverResolve),
}

export const itemDetail = {
	default: http.get(detailUrl, itemDetailResolver),
	error: http.get(detailUrl, () => to500()),
	retrySucceeds: () => http.get(detailUrl, withRetrySuccess(itemDetailResolver)),
	loading: http.get(detailUrl, neverResolve),
}

export const itemHandlers = [itemList.default, itemDetail.default]
