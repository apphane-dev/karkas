import type { ChartPoint } from '#entities/dashboard'

import { m } from '#paraglide/messages.js'
import { Card } from '#shared/components'
import { styled } from '#styled-system/jsx'

export function BarChart({ chartData }: { chartData: ChartPoint[] }) {
	const maxChartValue = Math.max(1, ...chartData.map((point) => point.value))
	const midValue = Math.round(maxChartValue / 2)

	return (
		<Card.Root p="5" borderWidth="1px" borderColor="border" borderRadius="xl" bg="gray.1">
			<styled.div fontSize="sm" fontWeight="semibold" mb="4">
				{m.dashboard_weekly_traffic()}
			</styled.div>
			<styled.div display="flex" gap="2">
				{/* Y-axis labels */}
				<styled.div
					display="flex"
					flexDirection="column"
					justifyContent="space-between"
					h="140px"
					pb="5"
					flexShrink={0}
				>
					<styled.span fontSize="2xs" color="muted" textAlign="right">
						{maxChartValue.toLocaleString()}
					</styled.span>
					<styled.span fontSize="2xs" color="muted" textAlign="right">
						{midValue.toLocaleString()}
					</styled.span>
					<styled.span fontSize="2xs" color="muted" textAlign="right">
						0
					</styled.span>
				</styled.div>

				{/* Bars */}
				<styled.div display="flex" alignItems="flex-end" gap="2" h="140px" flex="1">
					{chartData.map((point) => (
						<styled.div
							key={point.label}
							flex="1"
							display="flex"
							flexDirection="column"
							alignItems="center"
							gap="1"
							h="100%"
							justifyContent="flex-end"
						>
							<styled.div
								w="100%"
								bg="colorPalette.9"
								borderRadius="sm"
								style={{ height: `${(point.value / maxChartValue) * 100}%` }}
								transition="height 0.3s"
								title={`${point.label}: ${point.value.toLocaleString()}`}
							/>
							<styled.span fontSize="xs" color="muted">
								{point.label}
							</styled.span>
						</styled.div>
					))}
				</styled.div>
			</styled.div>
		</Card.Root>
	)
}
