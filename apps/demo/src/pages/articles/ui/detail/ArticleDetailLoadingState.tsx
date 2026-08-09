import { m } from '#paraglide/messages.js'
import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

const paragraphRows = Array.from({ length: 4 }, (_, index) => index)

export function ArticleDetailLoadingState() {
	return (
		<styled.div p="8" role="status" aria-label={m.article_loading_detail()}>
			<div inert>
				<styled.div display="flex" alignItems="center" gap="3" mb="6">
					<Skeleton h="9" w="45%" />
					<Skeleton h="6" w="20" borderRadius="full" />
				</styled.div>
				<styled.div mb="6">
					<Skeleton h="4" w="100%" mb="2" />
					<Skeleton h="4" w="90%" />
				</styled.div>
				<styled.div display="grid" gap="4">
					{paragraphRows.map((row) => (
						<styled.div key={row}>
							<Skeleton h="4" w="100%" mb="2" />
							<Skeleton h="4" w={row % 2 === 0 ? '84%' : '93%'} />
						</styled.div>
					))}
				</styled.div>
			</div>
		</styled.div>
	)
}
