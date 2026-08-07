import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

const loadingItems = Array.from({ length: 7 }, (_, index) => index)

export function ConnectionListLoading() {
	return (
		<>
			<styled.div px="3" py="3" borderBottomWidth="1px" borderColor="border" display="flex" gap="0">
				<Skeleton h="8" flex="1" borderRadius="l2" />
				<Skeleton h="8" w="8" borderRadius="l2" flexShrink={0} />
				<Skeleton h="8" w="8" borderRadius="l2" flexShrink={0} />
			</styled.div>
			{loadingItems.map((item) => (
				<styled.div key={item} px="4" py="3" borderBottomWidth="1px" borderColor="border">
					<styled.div
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						gap="2"
						mb="2"
					>
						<Skeleton h="4" w="65%" />
						<Skeleton h="5" w="20" borderRadius="full" />
					</styled.div>
					<styled.div display="flex" alignItems="center" gap="2">
						<Skeleton h="5" w="20" borderRadius="full" />
						<Skeleton h="3.5" w="70%" />
					</styled.div>
				</styled.div>
			))}
		</>
	)
}
