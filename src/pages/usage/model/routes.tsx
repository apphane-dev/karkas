import { abortVar, retryComputed, wrap } from '@reatom/core'

import { protectedRoute } from '#entities/auth'
import { fetchUsageData } from '#entities/usage'
import { m } from '#paraglide/messages.js'
import { PageError } from '#widgets/data-page'

import { UsagePage } from '../ui/UsagePage'
import { UsagePageLoading } from '../ui/UsagePageLoading'

const fetchUsageDataForRoute = async () =>
	await wrap(fetchUsageData({ signal: abortVar.require().signal }))

export const usageRoute = protectedRoute.reatomRoute(
	{
		path: 'usage',
		loader: fetchUsageDataForRoute,
		render: (self) => {
			const { isFirstPending, isPending, data } = self.loader.status()
			if (isFirstPending || (isPending && !data)) {
				return <UsagePageLoading />
			}
			if (!data) {
				return (
					<PageError
						title={m.usage_error_title()}
						description={m.usage_error_description()}
						onRetry={wrap(() => retryComputed(self.loader))}
					/>
				)
			}
			return <UsagePage data={data} />
		},
	},
	'usage',
)
