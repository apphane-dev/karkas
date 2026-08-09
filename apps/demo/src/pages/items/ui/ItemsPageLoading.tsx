import { m } from '#paraglide/messages.js'
import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

const itemRows = Array.from({ length: 7 }, (_, index) => index)

export function ItemsPageLoading() {
	return (
		<styled.div role="status" aria-label={m.items_loading_page()} p="6">
			<Skeleton h="8" w="24" mb="6" />
			<styled.div display="flex" flexWrap="wrap" gap="3" mb="6" alignItems="center">
				<Skeleton h="9" w="40" borderRadius="md" />
				<Skeleton h="9" w="20" borderRadius="md" />
				<Skeleton h="9" w="40" borderRadius="md" />
				<Skeleton h="9" w="36" borderRadius="md" />
			</styled.div>
			<styled.div display="grid" gap="3">
				{itemRows.map((item) => (
					<Skeleton key={item} h="14" borderRadius="lg" />
				))}
			</styled.div>
		</styled.div>
	)
}
