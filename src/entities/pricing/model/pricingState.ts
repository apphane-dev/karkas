import type { PlanId, PricingData } from './types'

import { abortVar, action, atom, computed, withAsyncData, wrap } from '@reatom/core'

import { fetchPricing } from '../api/pricingApi'

// Global cached pricing query for the sidebar banner, which renders on every
// page. An async computed with `withAsyncData` is an abortable context, so the
// fetch receives the computed's own abort signal.
export const pricingDataAtom = computed(
	async () => await wrap(fetchPricing({ signal: abortVar.require().signal })),
	'pricing.data',
).extend(withAsyncData())

// Shared across the /pricing route model and the sidebar banner. Reset on
// logout (see the app-layer logout orchestration) so a second user logging in
// within the same SPA session never sees the previous user's plan.
export const currentPlanIdAtom = atom<PlanId | undefined>(undefined, 'pricing.currentPlanId')

export const syncPricingData = action((data: PricingData) => {
	currentPlanIdAtom.set(data.currentPlanId)
}, 'pricing.syncData')

export const setCurrentPlanId = action((planId: PlanId) => {
	currentPlanIdAtom.set(planId)
}, 'pricing.setCurrentPlanId')

export const resetCurrentPlanId = action(() => {
	currentPlanIdAtom.set(undefined)
}, 'pricing.resetCurrentPlanId')
