import { m } from '#paraglide/messages.js'
import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

const statRows = Array.from({ length: 4 }, (_, index) => index)

export function DashboardPageLoading() {
	return (
		<styled.div role="status" aria-label={m.dashboard_loading_page()} p="6">
			<Skeleton h="8" w="40" mb="6" />
			<styled.div
				display="grid"
				gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
				gap="4"
				mb="6"
			>
				{statRows.map((item) => (
					<Skeleton key={item} h="28" borderRadius="xl" />
				))}
			</styled.div>
			<styled.div
				display="grid"
				gridTemplateColumns={{ base: '1fr', lg: '1fr 1fr' }}
				gap="4"
				mb="6"
			>
				<Skeleton h="72" borderRadius="xl" />
				<Skeleton h="72" borderRadius="xl" />
			</styled.div>
			<Skeleton h="72" borderRadius="xl" />
		</styled.div>
	)
}
