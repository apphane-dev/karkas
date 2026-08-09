import type { Plan } from '#entities/pricing'

import { reatomComponent } from '@reatom/react'

import { currentPlanIdAtom, pricingDataAtom } from '#entities/pricing'
import { m } from '#paraglide/messages.js'
import { css } from '#styled-system/css'
import { styled } from '#styled-system/jsx'

const pricingBannerCopy = ({
	currentPlan,
	isFree,
	proPlan,
}: {
	currentPlan: Plan | undefined
	isFree: boolean
	proPlan: Plan | undefined
}) => {
	if (isFree) {
		return {
			description: m.pricing_sidebar_upgrade_desc({
				storage: proPlan?.features[0] ?? m.pricing_sidebar_upgrade_storage(),
			}),
			title: m.pricing_sidebar_upgrade_title(),
		}
	}

	return {
		description: currentPlan?.features.slice(0, 2).join(' · ') || m.pricing_sidebar_manage_desc(),
		title: currentPlan
			? m.pricing_sidebar_current_title({ name: currentPlan.name })
			: m.pricing_sidebar_current_generic_title(),
	}
}

export const PricingBanner = reatomComponent(
	({ active, plans: routePlans }: { active?: boolean; plans?: Plan[] }) => {
		const syncedPlanId = currentPlanIdAtom()
		const pricingData = active ? undefined : pricingDataAtom.data()
		const currentPlanId = syncedPlanId ?? pricingData?.currentPlanId
		const plans = routePlans ?? pricingData?.plans
		const currentPlan = plans?.find((plan) => plan.id === currentPlanId)
		const proPlan = plans?.find((plan) => plan.id === 'pro')
		const copy = pricingBannerCopy({
			currentPlan,
			isFree: currentPlanId === undefined || currentPlanId === 'free',
			proPlan,
		})

		return (
			<styled.div
				px="2"
				py="2"
				borderRadius="md"
				bg={active ? 'colorPalette.surface.bg.active' : 'transparent'}
				_hover={{ bg: 'colorPalette.surface.bg.active' }}
				cursor="pointer"
				w="full"
				className={css({ '[data-sidebar-collapsed] &': { display: 'none' } })}
			>
				<styled.div fontWeight="medium" fontSize="sm" color="gray.12" mb="0.5">
					{copy.title}
				</styled.div>
				<styled.div fontSize="xs" color="muted" mb="2">
					{copy.description}
				</styled.div>
				<styled.div
					fontSize="xs"
					fontWeight="medium"
					color="blue.subtle.fg"
					bg="blue.subtle.bg"
					px="2"
					py="0.5"
					borderRadius="sm"
					display="inline-block"
				>
					{m.pricing_sidebar_view_plans()}
				</styled.div>
			</styled.div>
		)
	},
	'PricingBanner',
)
