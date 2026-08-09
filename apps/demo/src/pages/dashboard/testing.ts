import { createActor, heading, text, withPageError, withRetryAndLoading } from '#shared/test'

export const dashboardLoc = {
	heading: heading('Dashboard'),
}

export const dashboardActor = createActor()
	.extend(withRetryAndLoading('Loading dashboard page'))
	.extend(withPageError({ title: 'Could not load dashboard' }))
	.extend((I) => ({
		seeDashboardContent: async () => {
			await I.see(dashboardLoc.heading)
			await I.see(text('Total Revenue'))
			await I.see(text('Active Users'))
		},
	}))
