import type { PricingData, PlanId } from '#entities/pricing'

import { abortVar, action, atom, framePromise, sleep, withAbort, wrap } from '@reatom/core'

import { currentPlanIdAtom, setCurrentPlanId, subscribeToPlan } from '#entities/pricing'
import { m } from '#paraglide/messages.js'
import { toaster } from '#shared/components'

const SUBSCRIBE_DELAY_MS = 300

// `framePromise()` must be called before any `await` so it binds to the
// caller's action frame. That is why this helper performs the API request
// itself: it is invoked at the very start of the `subscribe` action, keeping
// the loading toast's lifecycle tied to a single, unbroken action frame.
async function subscribeWithToast(planId: PlanId, planName: string) {
	const id = toaster.create({
		title: m.pricing_subscribing({ name: planName }),
		type: 'loading',
		closable: false,
	})
	void framePromise().catch(() => {})

	try {
		const result = await wrap(subscribeToPlan(planId, { signal: abortVar.require().signal }))
		await wrap(sleep(SUBSCRIBE_DELAY_MS))
		toaster.update(id, {
			title: m.pricing_subscribed({ name: planName }),
			type: 'success',
		})
		globalThis.setTimeout(() => toaster.remove(id), SUBSCRIBE_DELAY_MS)
		return result.currentPlanId
	} catch (error) {
		toaster.remove(id)
		throw error
	}
}

export function reatomPricingPageModel(data: PricingData) {
	const plans = data.plans
	const currentPlanId = currentPlanIdAtom
	const pendingPlanId = atom<PlanId | null>(null, 'pricing.pendingPlanId')

	const isSubscribable = (planId: PlanId) => planId !== currentPlanId() && pendingPlanId() === null
	const planName = (planId: PlanId) => plans.find((plan) => plan.id === planId)?.name ?? ''
	const subscribeSafely = async (planId: PlanId) => {
		try {
			return await wrap(subscribeWithToast(planId, planName(planId)))
		} catch {
			toaster.create({ title: m.pricing_subscribe_error(), type: 'error' })
			return null
		}
	}

	const subscribe = action(async (planId: PlanId) => {
		if (!isSubscribable(planId)) return
		pendingPlanId.set(planId)
		const subscribedPlanId = await wrap(subscribeSafely(planId))
		if (subscribedPlanId) setCurrentPlanId(subscribedPlanId)
		pendingPlanId.set(null)
	}, 'pricing.subscribe').extend(withAbort())

	return { plans, currentPlanId, pendingPlanId, subscribe }
}

export type PricingPageModel = ReturnType<typeof reatomPricingPageModel>
