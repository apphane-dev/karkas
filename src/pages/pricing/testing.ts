import {
	createActor,
	button,
	heading,
	role,
	text,
	withPageError,
	withRetryAndLoading,
} from '#shared/test'

export const pricingLoc = {
	heading: heading('Pricing'),
	freeCard: role('region', 'Free'),
	proCard: role('region', 'Pro'),
	teamCard: role('region', 'Team'),
	currentPlanBadge: text('Current plan').options({ selector: '.badge' }),
}

export const pricingActor = createActor()
	.extend(withRetryAndLoading('Loading pricing plans'))
	.extend(
		withPageError({
			title: 'Could not load pricing',
			description: "We couldn't load the pricing plans. Try again in a moment.",
		}),
	)
	.extend((I) => ({
		seePricingContent: async () => {
			await I.see(pricingLoc.heading)
			await I.see(pricingLoc.freeCard)
			await I.see(pricingLoc.proCard)
			await I.see(pricingLoc.teamCard)
		},
		seeCurrentPlanOn: async (card: ReturnType<typeof role>) => {
			await I.see(pricingLoc.currentPlanBadge.within(card))
		},
		seeSubscribeToast: async (planName: string) => {
			await I.see(role('status', `Switching to ${planName}…`).within('global').wait())
			await I.waitExit(role('status', `Switching to ${planName}…`).within('global'))
			await I.see(role('status', `You're now on the ${planName} plan`).within('global').wait())
		},
		subscribe: async (card: ReturnType<typeof role>, buttonLabel: string) => {
			await I.click(button(buttonLabel).within(card))
		},
	}))
