import { m } from '#paraglide/messages.js'
import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

const timelineRows = Array.from({ length: 7 }, (_, index) => index)

export function TimelinePageLoading() {
	return (
		<styled.div role="status" aria-label={m.timeline_loading_page()} p="6" maxW="700px">
			<Skeleton h="8" w="28" mb="6" />
			<styled.div display="grid" gap="4">
				{timelineRows.map((row) => (
					<styled.div key={row} display="flex" gap="3" alignItems="flex-start">
						<Skeleton h="2.5" w="10" borderRadius="full" mt="2.5" />
						<Skeleton h="20" w="100%" borderRadius="xl" />
					</styled.div>
				))}
			</styled.div>
		</styled.div>
	)
}
