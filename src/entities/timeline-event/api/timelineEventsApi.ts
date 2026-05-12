import type { TimelineEvent } from '#entities/timeline-event/model/types'

import { apiClient } from '#shared/api'

export const TIMELINE_EVENTS_API_PATH = '/timeline'

export async function fetchTimelineEvents() {
	return apiClient.get<TimelineEvent[]>(TIMELINE_EVENTS_API_PATH)
}
