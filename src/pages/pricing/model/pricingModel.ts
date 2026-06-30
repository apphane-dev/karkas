import type { PricingData, PlanId } from '#entities/pricing'
import type { Plan } from '#entities/pricing'

import { action, atom, framePromise, sleep, withAbort, wrap } from '@reatom/core'

import { subscribeToPlan } from '#entities/pricing'
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
	let completed = false

	void framePromise()
		.finally(() => {
			if (!completed) toaster.remove(id)
		})
		.catch(() => {})

	try {
		await wrap(subscribeToPlan(planId))
		await wrap(sleep(SUBSCRIBE_DELAY_MS))
		toaster.update(id, {
			title: m.pricing_subscribed({ name: planName }),
			type: 'success',
		})
		completed = true
	} catch (error) {
		toaster.remove(id)
		throw error
	}
}

export function reatomPricingPageModel(data: PricingData) {
	const plans = data.plans
	const currentPlanId = atom<PlanId>(data.currentPlanId, 'pricing.currentPlanId')
	const pendingPlanId = atom<PlanId | null>(null, 'pricing.pendingPlanId')

	const subscribe = action(async (planId: PlanId) => {
		if (planId === currentPlanId() || pendingPlanId() !== null) return
		const plan = plans.find((item: Plan) => item.id === planId)
		pendingPlanId.set(planId)
		try {
			await wrap(subscribeWithToast(planId, plan?.name ?? ''))
			currentPlanId.set(planId)
		} catch {
			toaster.create({ title: m.pricing_subscribe_error(), type: 'error' })
		} finally {
			pendingPlanId.set(null)
		}
	}, 'pricing.subscribe').extend(withAbort())

	return { plans, currentPlanId, pendingPlanId, subscribe }
}

export type PricingPageModel = ReturnType<typeof reatomPricingPageModel>
