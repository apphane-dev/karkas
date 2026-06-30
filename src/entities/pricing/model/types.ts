export type PlanId = 'free' | 'pro' | 'team'

export type Plan = {
	id: PlanId
	name: string
	price: string
	features: string[]
	highlighted?: boolean
}

export type PricingData = {
	plans: Plan[]
	currentPlanId: PlanId
}

export type SubscriptionResult = {
	currentPlanId: PlanId
}
