import { m } from '#paraglide/messages.js'
import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

export function UsagePageLoading() {
	return (
		<styled.div
			role="status"
			aria-label={m.usage_loading_page()}
			p={{ base: '5', md: '8' }}
			maxW="1040px"
		>
			<styled.div mb="8">
				<Skeleton h="5" w="24" borderRadius="full" mb="4" />
				<Skeleton h="9" w="44" mb="3" />
				<Skeleton h="5" w="full" maxW="560px" />
			</styled.div>
			<Skeleton h="44" w="full" borderRadius="2xl" mb="6" />
			<Skeleton h="6" w="28" mb="3" />
			<styled.div
				display="grid"
				gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
				gap="3"
				mb="6"
			>
				<Skeleton h="28" borderRadius="xl" />
				<Skeleton h="28" borderRadius="xl" />
				<Skeleton h="28" borderRadius="xl" />
			</styled.div>
			<Skeleton h="6" w="24" mb="3" />
			<styled.div
				display="grid"
				gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
				gap="3"
			>
				<Skeleton h="28" borderRadius="xl" />
				<Skeleton h="28" borderRadius="xl" />
			</styled.div>
		</styled.div>
	)
}
