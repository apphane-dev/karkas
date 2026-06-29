import { m } from '#paraglide/messages.js'
import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

export function UsagePageLoading() {
	return (
		<styled.div role="status" aria-label={m.usage_loading_page()} p="8" maxW="600px">
			<Skeleton h="8" w="40" mb="8" />
			<Skeleton h="3" w="full" borderRadius="full" mb="2" />
			<Skeleton h="4" w="32" mb="8" />
			<Skeleton h="6" w="28" mb="3" />
			<Skeleton h="24" w="full" borderRadius="lg" />
		</styled.div>
	)
}
