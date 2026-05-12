import { m } from '#paraglide/messages.js'
import { Badge, Button, Text, VisuallyHidden } from '#shared/components'
import { styled } from '#styled-system/jsx'

const currentPlan = 'free'

const plans = [
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
]

type PlanCardProps = {
	name: string
	price: string
	features: string[]
	highlighted?: boolean
	isCurrent?: boolean
}

const getPlanButtonLabel = ({ name, highlighted, isCurrent }: PlanCardProps) => {
	if (isCurrent) return m.pricing_current_plan()
	if (highlighted) return m.pricing_upgrade_pro()
	return m.pricing_get_plan({ name })
}

const CurrentPlanBadge = ({ isCurrent }: { isCurrent: boolean | undefined }) => {
	if (!isCurrent) return null

	return (
		<Badge
			bg="green.subtle.bg"
			color="green.subtle.fg"
			borderWidth="1px"
			borderColor="green.subtle.fg"
			size="sm"
		>
			{m.pricing_current_plan()}
		</Badge>
	)
}

const PlanFeatures = ({ features }: { features: string[] }) => (
	<styled.ul display="flex" flexDirection="column" gap="2">
		{features.map((feature) => (
			<styled.li
				key={feature}
				fontSize="sm"
				color="muted"
				display="flex"
				alignItems="center"
				gap="2"
			>
				<styled.span color="green.9">✓</styled.span>
				{feature}
			</styled.li>
		))}
	</styled.ul>
)

function PlanCard(props: PlanCardProps) {
	const { name, price, features, highlighted, isCurrent } = props

	return (
		<styled.div
			p="6"
			borderWidth="1px"
			borderColor={highlighted ? 'blue.9' : 'gray.4'}
			borderRadius="lg"
			bg={highlighted ? 'blue.subtle.bg' : 'transparent'}
			display="flex"
			flexDirection="column"
			gap="4"
		>
			<styled.div>
				<styled.div display="flex" alignItems="center" gap="2" mb="1">
					<styled.span fontSize="lg" fontWeight="semibold">
						{name}
					</styled.span>
					<CurrentPlanBadge isCurrent={isCurrent} />
				</styled.div>
				<styled.div fontSize="2xl" fontWeight="bold">
					{price}
				</styled.div>
			</styled.div>
			<PlanFeatures features={features} />
			<Button
				mt="auto"
				w="full"
				{...(highlighted && { colorPalette: 'blue' })}
				variant={isCurrent ? 'subtle' : highlighted ? 'solid' : 'outline'}
				disabled={isCurrent}
			>
				{getPlanButtonLabel(props)}
			</Button>
		</styled.div>
	)
}

export function PricingPage() {
	return (
		<styled.div p="8" maxW="800px">
			<VisuallyHidden as="h1">{m.pricing_title()}</VisuallyHidden>
			<Text fontSize="sm" color="muted" mb="8">
				{m.pricing_desc()}
			</Text>

			<styled.div
				display="grid"
				gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
				gap="4"
			>
				{plans.map((plan) => (
					<PlanCard key={plan.name} {...plan} isCurrent={plan.id === currentPlan} />
				))}
			</styled.div>
		</styled.div>
	)
}
