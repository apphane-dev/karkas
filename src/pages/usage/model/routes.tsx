import { retryComputed, wrap } from '@reatom/core'

import { protectedRoute } from '#entities/auth'
import { fetchUsageData } from '#entities/usage'
import { m } from '#paraglide/messages.js'
import { PageError } from '#widgets/data-page'

import { UsagePage } from '../ui/UsagePage'
import { UsagePageLoading } from '../ui/UsagePageLoading'

// The route owns its own fetch so it can abort on navigation and surface
// retry/error through `self.loader.status()`. The sidebar's global
// `usageDataAtom` is a separate cached query; the two intentionally do not
// share/seed each other to avoid a manual `.data` write that a concurrent
// fetch could clobber.
export const usageRoute = protectedRoute.reatomRoute(
	{
		path: 'usage',
		loader: () => wrap(fetchUsageData()),
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
