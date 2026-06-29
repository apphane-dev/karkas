import { retryComputed, wrap } from '@reatom/core'

import { protectedRoute } from '#entities/auth'
import { fetchUsageData } from '#entities/usage'
import { m } from '#paraglide/messages.js'
import { PageError } from '#widgets/data-page'

import { UsagePage } from '../ui/UsagePage'
import { UsagePageLoading } from '../ui/UsagePageLoading'

export const usageRoute = protectedRoute.reatomRoute(
	{
		path: 'usage',
		loader: fetchUsageData,
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
