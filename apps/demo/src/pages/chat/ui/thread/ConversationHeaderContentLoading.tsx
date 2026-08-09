import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

export function ConversationHeaderContentLoading() {
	return (
		<styled.div display="flex" alignItems="center" gap="3" minW="0">
			<Skeleton h="8" w="8" borderRadius="full" />
			<styled.div minW="0">
				<Skeleton h="4" w="24" mb="1.5" />
				<Skeleton h="3" w="14" />
			</styled.div>
		</styled.div>
	)
}
