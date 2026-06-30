import { m } from '#paraglide/messages.js'
import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

export function PricingPageLoading() {
	return (
		<styled.div role="status" aria-label={m.pricing_loading_page()} p="8" maxW="800px">
			<Skeleton h="8" w="32" mb="8" />
			<styled.div
				display="grid"
				gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
				gap="4"
			>
				<Skeleton h="64" w="full" borderRadius="lg" />
				<Skeleton h="64" w="full" borderRadius="lg" />
				<Skeleton h="64" w="full" borderRadius="lg" />
			</styled.div>
		</styled.div>
	)
}
