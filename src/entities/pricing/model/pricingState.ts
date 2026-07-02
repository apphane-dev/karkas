import type { PlanId } from './types'

import { atom, computed, withAsyncData } from '@reatom/core'

import { fetchPricing } from '../api/pricingApi'

// Global cached pricing query for the sidebar banner, which renders on every
// page. The transport reads this async computed's abort frame, so the fetch
// receives the computed's own abort signal.
export const pricingDataAtom = computed(() => fetchPricing(), 'pricing.data').extend(
	withAsyncData(),
)

// Shared across the /pricing route model and the sidebar banner. Cleared on
// logout (see the app-layer `signOut` orchestration) so a second user logging
// in within the same SPA session never sees the previous user's plan. Callers
// write it directly with `.set(...)` — no forwarding actions.
export const currentPlanIdAtom = atom<PlanId | undefined>(undefined, 'pricing.currentPlanId')
