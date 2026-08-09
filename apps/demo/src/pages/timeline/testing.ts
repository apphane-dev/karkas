import { createActor, text, withPageError, withRetryAndLoading } from '#shared/test'

export const timelineActor = createActor()
	.extend(withRetryAndLoading('Loading timeline page'))
	.extend(withPageError({ title: 'Could not load timeline' }))
	.extend((I) => ({
		seeTimelineEvents: async () => {
			await I.see(text('Deployed v2.4.1 to production'))
			await I.see(text('Merged PR #482 - Auth token refresh'))
		},
		seeDateGroups: async () => {
			await I.see(text('Today').all())
			await I.see(text('Yesterday').all())
		},
	}))
