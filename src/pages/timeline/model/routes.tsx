import { retryComputed, wrap } from '@reatom/core'

import { protectedRoute } from '#entities/auth'
import { fetchTimelineEvents } from '#entities/timeline-event'
import { m } from '#paraglide/messages.js'
import { PageError } from '#widgets/data-page'

import { TimelinePage } from '../ui/TimelinePage'
import { TimelinePageLoading } from '../ui/TimelinePageLoading'

export const timelineRoute = protectedRoute.reatomRoute(
	{
		path: 'timeline',
		loader: fetchTimelineEvents,
		render: (self) => {
			const { isFirstPending, isPending, data: events } = self.loader.status()
			if (isFirstPending || (isPending && !events)) {
				return <TimelinePageLoading />
			}
			if (!events) {
				return (
					<PageError
						title={m.timeline_error_title()}
						description={m.timeline_error_description()}
						onRetry={wrap(() => retryComputed(self.loader))}
					/>
				)
			}
			return <TimelinePage events={events} />
		},
	},
	'timeline',
)
