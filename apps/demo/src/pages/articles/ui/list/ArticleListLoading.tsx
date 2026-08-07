import { Skeleton } from '#shared/components'
import { HStack, VStack } from '#styled-system/jsx'

const loadingItems = Array.from({ length: 6 }, (_, index) => index)

export function ArticleListLoading() {
	return (
		<>
			<HStack px="3" py="3" borderBottomWidth="1px" borderColor="border">
				<Skeleton h="8" flex="1" borderRadius="l2" />
			</HStack>
			{loadingItems.map((item) => (
				<VStack
					key={item}
					px="4"
					py="3"
					borderBottomWidth="1px"
					borderColor="border"
					gap="2"
					alignItems="stretch"
				>
					<HStack alignItems="center" justifyContent="space-between" gap="2">
						<Skeleton h="4" w="70%" />
						<Skeleton h="4" w="20%" />
					</HStack>
					<Skeleton h="3.5" w="85%" />
				</VStack>
			))}
		</>
	)
}
