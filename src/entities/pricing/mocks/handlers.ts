import type { PlanId } from '#entities/pricing/model/types'

import { assert } from '@reatom/core'
import { HttpResponse, delay, http, type HttpResponseResolver } from 'msw'

import { PRICING_API_PATH, SUBSCRIBE_API_PATH } from '#entities/pricing/api/pricingApi'
import { pricingMockData } from '#entities/pricing/mocks/data'
import { composeApiUrl } from '#shared/api'
import { Error400 } from '#shared/mocks'
import { neverResolve, to500, withRetrySuccess } from '#shared/mocks/utils'

const url = composeApiUrl(PRICING_API_PATH)
const subscribeUrl = composeApiUrl(SUBSCRIBE_API_PATH)

const pricingResolver = (async () => {
	await delay()
	return HttpResponse.json(pricingMockData)
}) satisfies HttpResponseResolver

const subscribeResolver = (async ({ request }) => {
	await delay()
	const body = (await request.json()) as { planId: PlanId }
	const exists = pricingMockData.plans.some((plan) => plan.id === body.planId)
	assert(exists, `Unknown plan: ${body.planId}`, Error400)
	return HttpResponse.json({ currentPlanId: body.planId })
}) satisfies HttpResponseResolver

export const pricingPlans = {
	default: http.get(url, pricingResolver),
	error: http.get(url, () => to500()),
	retrySucceeds: () => http.get(url, withRetrySuccess(pricingResolver)),
	loading: http.get(url, neverResolve),
}

export const pricingSubscribe = {
	default: http.post(subscribeUrl, subscribeResolver),
	error: http.post(subscribeUrl, () => to500()),
}

export const pricingHandlers = [pricingPlans.default, pricingSubscribe.default]
