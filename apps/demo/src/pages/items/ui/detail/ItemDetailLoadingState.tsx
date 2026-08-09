import { m } from '#paraglide/messages.js'
import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

export function ItemDetailLoadingState() {
	return (
		<styled.div p="8" role="status" aria-label={m.item_loading_detail()}>
			<div inert>
				<styled.div mb="6">
					<Skeleton h="8" w="56" mb="3" />
					<Skeleton h="5" w="32" />
				</styled.div>
				<styled.div display="grid" gap="3">
					<Skeleton h="4" w="full" />
					<Skeleton h="4" w="full" />
					<Skeleton h="4" w="full" />
					<Skeleton h="4" w="full" />
				</styled.div>
			</div>
		</styled.div>
	)
}
