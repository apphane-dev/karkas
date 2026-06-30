import type { PricingData, PlanId, SubscriptionResult } from '#entities/pricing/model/types'

import { apiClient } from '#shared/api'

export const PRICING_API_PATH = '/pricing'
export const SUBSCRIBE_API_PATH = '/pricing/subscribe'

export async function fetchPricing() {
	return apiClient.get<PricingData>(PRICING_API_PATH)
}

export async function subscribeToPlan(planId: PlanId) {
	return apiClient.post<SubscriptionResult>(SUBSCRIBE_API_PATH, { body: { planId } })
}
