import { abortVar, retryComputed, wrap } from '@reatom/core'

import { protectedRoute } from '#entities/auth'
import { fetchDashboardData } from '#entities/dashboard'
import { m } from '#paraglide/messages.js'
import { PageError } from '#widgets/data-page'

import { DashboardPage } from '../ui/DashboardPage'
import { DashboardPageLoading } from '../ui/DashboardPageLoading'

const fetchDashboardDataForRoute = async () =>
	await wrap(fetchDashboardData({ signal: abortVar.require().signal }))

export const dashboardRoute = protectedRoute.reatomRoute(
	{
		path: 'dashboard',
		loader: fetchDashboardDataForRoute,
		render: (self) => {
			const { isFirstPending, isPending, data } = self.loader.status()
			if (isFirstPending || (isPending && !data)) {
				return <DashboardPageLoading />
			}
			if (!data) {
				return (
					<PageError
						title={m.dashboard_error_title()}
						description={m.dashboard_error_description()}
						onRetry={wrap(() => retryComputed(self.loader))}
					/>
				)
			}
			return <DashboardPage data={data} />
		},
	},
	'dashboard',
)
