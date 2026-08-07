import { m } from '#paraglide/messages.js'
import { Skeleton } from '#shared/components'
import { styled } from '#styled-system/jsx'

const connectionDetailRows = [
	{ label: '40%', value: '65%' },
	{ label: '28%', value: '48%' },
	{ label: '34%', value: '58%' },
	{ label: '22%', value: '36%' },
] as const

const activityMarkers = ['18%', '24%', '20%'] as const

export function ConnectionDetailLoadingState() {
	return (
		<styled.div p="8" role="status" aria-label={m.connection_loading_detail()}>
			<div inert>
				<styled.div
					display="flex"
					alignItems="flex-start"
					justifyContent="space-between"
					gap="4"
					mb="7"
				>
					<styled.div display="flex" alignItems="center" gap="4" flex="1">
						<Skeleton h="12" w="12" borderRadius="xl" />
						<styled.div flex="1">
							<Skeleton h="7" w="55%" mb="2" />
							<Skeleton h="4" w="38%" />
						</styled.div>
					</styled.div>
					<styled.div display="flex" gap="2">
						<Skeleton h="6" w="16" borderRadius="full" />
						<Skeleton h="8" w="24" borderRadius="md" />
					</styled.div>
				</styled.div>

				<styled.div display="grid" gap="3">
					{connectionDetailRows.map((row) => (
						<styled.div
							key={`${row.label}-${row.value}`}
							display="grid"
							gridTemplateColumns="7rem 1fr"
							alignItems="center"
							gap="4"
							p="3"
							borderWidth="1px"
							borderColor="border"
							borderRadius="lg"
						>
							<Skeleton h="3" w={row.label} />
							<Skeleton h="4" w={row.value} />
						</styled.div>
					))}
				</styled.div>

				<styled.div display="flex" gap="2" mt="6" flexWrap="wrap">
					{activityMarkers.map((width) => (
						<Skeleton key={width} h="5" w={width} borderRadius="full" />
					))}
				</styled.div>
			</div>
		</styled.div>
	)
}
