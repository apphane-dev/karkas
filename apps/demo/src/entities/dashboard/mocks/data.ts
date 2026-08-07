import type { DashboardData } from '#entities/dashboard/model/types'

export const dashboardMockData = {
	stats: [
		{ label: 'Total Revenue', value: '$45,231', change: '+12.5%', trend: 'up' },
		{ label: 'Active Users', value: '2,338', change: '+8.2%', trend: 'up' },
		{ label: 'Bounce Rate', value: '24.3%', change: '-3.1%', trend: 'down' },
		{ label: 'Avg. Session', value: '4m 32s', change: '+18.7%', trend: 'up' },
	],
	recentActivity: [
		{ id: '1', user: 'Alex', action: 'deployed', target: 'v2.4.1 to production', time: '2m ago' },
		{ id: '2', user: 'Sam', action: 'merged', target: 'PR #482 - auth refactor', time: '18m ago' },
		{
			id: '3',
			user: 'Jordan',
			action: 'opened',
			target: 'issue #91 - dashboard perf',
			time: '45m ago',
		},
		{
			id: '4',
			user: 'Morgan',
			action: 'commented on',
			target: 'PR #479 - search API',
			time: '1h ago',
		},
		{
			id: '5',
			user: 'Casey',
			action: 'closed',
			target: 'issue #87 - login timeout',
			time: '2h ago',
		},
		{
			id: '6',
			user: 'Alex',
			action: 'pushed',
			target: '3 commits to feature/items',
			time: '3h ago',
		},
	],
	topPages: [
		{ path: '/dashboard', views: 4821, percent: 100 },
		{ path: '/articles', views: 3104, percent: 64 },
		{ path: '/items', views: 2450, percent: 51 },
		{ path: '/connections', views: 1832, percent: 38 },
		{ path: '/settings', views: 921, percent: 19 },
	],
	chartData: [
		{ label: 'Mon', value: 42 },
		{ label: 'Tue', value: 58 },
		{ label: 'Wed', value: 35 },
		{ label: 'Thu', value: 71 },
		{ label: 'Fri', value: 64 },
		{ label: 'Sat', value: 28 },
		{ label: 'Sun', value: 19 },
	],
} satisfies DashboardData
