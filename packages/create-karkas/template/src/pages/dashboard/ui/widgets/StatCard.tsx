import type { StatCard } from '#entities/dashboard'

import { TrendingDown, TrendingUp } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { Badge, Card } from '#shared/components'
import { css } from '#styled-system/css'
import { styled } from '#styled-system/jsx'

export function StatCard({ stat }: { stat: StatCard }) {
	const isUp = stat.trend === 'up'
	return (
		<Card.Root p="5" borderWidth="1px" borderColor="border" borderRadius="xl" bg="gray.1">
			<styled.div fontSize="xs" color="muted" fontWeight="medium" mb="1">
				{stat.label}
			</styled.div>
			<styled.div fontSize="2xl" fontWeight="bold" fontVariantNumeric="tabular-nums" mb="2">
				{stat.value}
			</styled.div>
			<styled.div display="flex" alignItems="center" gap="1">
				{isUp ? (
					<TrendingUp className={css({ w: '3.5', h: '3.5', color: 'green.11' })} />
				) : (
					<TrendingDown className={css({ w: '3.5', h: '3.5', color: 'red.11' })} />
				)}
				<Badge
					size="sm"
					bg={isUp ? 'green.subtle.bg' : 'red.subtle.bg'}
					color={isUp ? 'green.subtle.fg' : 'red.subtle.fg'}
					borderWidth="1px"
					borderColor={isUp ? 'green.6' : 'red.6'}
				>
					{stat.change}
				</Badge>
				<styled.span fontSize="xs" color="muted">
					{m.dashboard_stat_vs_last_week()}
				</styled.span>
			</styled.div>
		</Card.Root>
	)
}
