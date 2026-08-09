type Trend = 'up' | 'down'

export type StatCard = {
	label: string
	value: string
	change: string
	trend: Trend
}

export type ActivityItem = {
	id: string
	user: string
	action: string
	target: string
	time: string
}

export type TopPage = {
	path: string
	views: number
	percent: number
}

export type ChartPoint = {
	label: string
	value: number
}

export type DashboardData = {
	stats: StatCard[]
	recentActivity: ActivityItem[]
	topPages: TopPage[]
	chartData: ChartPoint[]
}
