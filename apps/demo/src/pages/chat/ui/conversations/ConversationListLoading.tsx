import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

const loadingItems = Array.from({ length: 8 }, (_, index) => index)

export function ConversationListLoading() {
	return (
		<styled.div>
			<styled.div p="4" borderBottomWidth="1px" borderColor="border">
				<Skeleton h="9" w="100%" borderRadius="md" />
			</styled.div>
			{loadingItems.map((item) => (
				<styled.div
					key={item}
					display="flex"
					alignItems="center"
					gap="3"
					px="4"
					py="3"
					borderBottomWidth="1px"
					borderColor="border"
				>
					<Skeleton h="10" w="10" borderRadius="full" />
					<styled.div flex="1" minW="0">
						<styled.div display="flex" justifyContent="space-between" alignItems="center" mb="1">
							<Skeleton h="4" w="45%" />
							<Skeleton h="3.5" w="12" />
						</styled.div>
						<Skeleton h="3.5" w="75%" />
					</styled.div>
				</styled.div>
			))}
		</styled.div>
	)
}
