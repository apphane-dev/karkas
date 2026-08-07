import type { DashboardData } from '#entities/dashboard'

import { reatomComponent } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import { VisuallyHidden } from '#shared/components'
import { styled } from '#styled-system/jsx'

import { BarChart } from './widgets/BarChart'
import { RecentActivityList } from './widgets/RecentActivityList'
import { StatCard } from './widgets/StatCard'
import { TopPagesList } from './widgets/TopPagesList'

const emptyDashboardData = {
	stats: [],
	recentActivity: [],
	topPages: [],
	chartData: [],
} satisfies DashboardData

type DashboardPageProps = {
	data: DashboardData | undefined
}

export const DashboardPage = reatomComponent(function DashboardPage({ data }: DashboardPageProps) {
	const safeData = data ?? emptyDashboardData

	return (
		<styled.div p="6">
			<VisuallyHidden as="h1">{m.dashboard_title()}</VisuallyHidden>

			<styled.div
				display="grid"
				gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
				gap="4"
				mb="6"
			>
				{safeData.stats.map((stat) => (
					<StatCard key={stat.label} stat={stat} />
				))}
			</styled.div>

			<styled.div
				display="grid"
				gridTemplateColumns={{ base: '1fr', lg: '1fr 1fr' }}
				gap="4"
				mb="6"
			>
				<BarChart chartData={safeData.chartData} />
				<TopPagesList topPages={safeData.topPages} />
			</styled.div>

			<RecentActivityList recentActivity={safeData.recentActivity} />
		</styled.div>
	)
})
