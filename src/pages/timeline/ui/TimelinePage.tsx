import type { TimelineEvent } from '#entities/timeline-event'

import { reatomComponent } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import { VisuallyHidden } from '#shared/components'
import { styled } from '#styled-system/jsx'

import { TimelineEventCard } from './TimelineEventCard'

export const TimelinePage = reatomComponent(({ events }: { events: TimelineEvent[] }) => {
	const grouped = new Map<string, TimelineEvent[]>()

	for (const event of events) {
		const list = grouped.get(event.date) ?? []
		list.push(event)
		grouped.set(event.date, list)
	}

	return (
		<styled.div p="6" maxW="700px">
			<VisuallyHidden as="h1">{m.timeline_title()}</VisuallyHidden>

			{Array.from(grouped.entries()).map(([date, dateEvents]) => (
				<styled.div key={date} mb="2">
					<styled.div
						fontSize="xs"
						fontWeight="semibold"
						color="muted"
						textTransform="uppercase"
						letterSpacing="wide"
						mb="4"
						pl="13"
					>
						{date}
					</styled.div>
					{dateEvents.map((event) => (
						<TimelineEventCard key={event.id} event={event} />
					))}
				</styled.div>
			))}
		</styled.div>
	)
}, 'TimelinePage')
