import { retryComputed, wrap } from '@reatom/core'

import { fetchDashboardData } from '#entities/dashboard'
import { m } from '#paraglide/messages.js'
import { protectedRoute } from '#shared/router'
import { PageError } from '#widgets/data-page'

import { DashboardPage } from '../ui/DashboardPage'
import { DashboardPageLoading } from '../ui/DashboardPageLoading'

export const dashboardRoute = protectedRoute.reatomRoute(
	{
		path: 'dashboard',
		loader: () => wrap(fetchDashboardData()),
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
