import type { PlanId } from '#entities/pricing/model/types'

import { assert } from '@reatom/core'
import { HttpResponse, delay, http, type HttpResponseResolver } from 'msw'

import { PRICING_API_PATH, SUBSCRIBE_API_PATH } from '#entities/pricing/api/pricingApi'
import { pricingMockData } from '#entities/pricing/mocks/data'
import { composeApiUrl } from '#shared/api'
import { Error400, registerMockReset } from '#shared/mocks'
import { neverResolve, to500, withRetrySuccess } from '#shared/mocks/utils'

const url = composeApiUrl(PRICING_API_PATH)
const subscribeUrl = composeApiUrl(SUBSCRIBE_API_PATH)

// The subscribed plan is ad-hoc mock state that is not a collection, so it
// registers its own reset callback with the shared registry (see
// shared/mocks/store) instead of forcing a keyed store shape.
let currentPlanId: PlanId = pricingMockData.currentPlanId
registerMockReset(() => {
	currentPlanId = pricingMockData.currentPlanId
})

const readCurrentPlanId = () => currentPlanId

const resetCurrentPlanId = () => {
	currentPlanId = pricingMockData.currentPlanId
	return currentPlanId
}

const pricingResolver = (async () => {
	await delay()
	return HttpResponse.json({ ...pricingMockData, currentPlanId: readCurrentPlanId() })
}) satisfies HttpResponseResolver

const resetPricingResolver = (async () => {
	await delay()
	return HttpResponse.json({ ...pricingMockData, currentPlanId: resetCurrentPlanId() })
}) satisfies HttpResponseResolver

const subscribeResolver = (async ({ request }) => {
	await delay()
	const body = (await request.json()) as { planId: PlanId }
	const exists = pricingMockData.plans.some((plan) => plan.id === body.planId)
	assert(exists, `Unknown plan: ${body.planId}`, Error400)
	currentPlanId = body.planId
	return HttpResponse.json({ currentPlanId: body.planId })
}) satisfies HttpResponseResolver

export const pricingPlans = {
	default: http.get(url, pricingResolver),
	reset: http.get(url, resetPricingResolver),
	error: http.get(url, () => to500()),
	retrySucceeds: () => http.get(url, withRetrySuccess(pricingResolver)),
	loading: http.get(url, neverResolve),
}

export const pricingSubscribe = {
	default: http.post(subscribeUrl, subscribeResolver),
	error: http.post(subscribeUrl, () => to500()),
}

export const pricingHandlers = [pricingPlans.default, pricingSubscribe.default]
