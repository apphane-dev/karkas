import type { PricingData } from '#entities/pricing/model/types'

export const pricingMockData = {
	plans: [
		{
			id: 'free',
			name: 'Free',
			price: '$0/mo',
			features: ['1 GB storage', '3 users', 'Community support'],
		},
		{
			id: 'pro',
			name: 'Pro',
			price: '$12/mo',
			features: ['10 GB storage', '10 users', 'Priority support'],
			highlighted: true,
		},
		{
			id: 'team',
			name: 'Team',
			price: '$29/mo',
			features: ['100 GB storage', 'Unlimited users', 'Dedicated support'],
		},
	],
	currentPlanId: 'free',
} satisfies PricingData
