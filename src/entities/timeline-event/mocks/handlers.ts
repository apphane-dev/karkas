import { assert } from '@reatom/core'
import { HttpResponse, delay, http, type HttpResponseResolver } from 'msw'

import { timelineEventsMockData } from '#entities/timeline-event/mocks/data'
import { composeApiUrl } from '#shared/api'
import { Error404 } from '#shared/mocks'
import { neverResolve, to500, withRetrySuccess } from '#shared/mocks/utils'

import { TIMELINE_EVENTS_API_PATH } from '../api/timelineEventsApi'

const listUrl = composeApiUrl(TIMELINE_EVENTS_API_PATH)
const detailUrl = composeApiUrl(`${TIMELINE_EVENTS_API_PATH}/:timelineEventId`)

const timelineEventListResolver = (async () => {
	await delay()

	return HttpResponse.json(timelineEventsMockData.map(({ description: _, ...rest }) => rest))
}) satisfies HttpResponseResolver

const timelineEventDetailResolver = (async ({ params }) => {
	await delay()

	const timelineEventId = params['timelineEventId']
	const timelineEvent = timelineEventsMockData.find(
		(timelineEvent) => timelineEvent.id === timelineEventId,
	)
	assert(
		timelineEvent,
		`Timeline event with id ${timelineEventId} not found in mock data`,
		Error404,
	)

	return HttpResponse.json(timelineEvent)
}) satisfies HttpResponseResolver

export const timelineEventList = {
	default: http.get(listUrl, timelineEventListResolver),
	error: http.get(listUrl, () => to500()),
	retrySucceeds: () => http.get(listUrl, withRetrySuccess(timelineEventListResolver)),
	loading: http.get(listUrl, neverResolve),
}

export const timelineEventDetail = {
	default: http.get(detailUrl, timelineEventDetailResolver),
}

export const timelineEventHandlers = [timelineEventList.default, timelineEventDetail.default]
