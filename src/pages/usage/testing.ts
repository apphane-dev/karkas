import { createActor, heading, text, withPageError, withRetryAndLoading } from '#shared/test'

export const usageLoc = {
	heading: heading('Usage'),
	storageResetNote: text('Storage usage resets on the 1st of each month.'),
	breakdownHeading: heading('Breakdown'),
	documentsRow: text('Documents'),
	mediaRow: text('Media'),
	otherRow: text('Other'),
}

export const usageActor = createActor()
	.extend(withRetryAndLoading('Loading usage page'))
	.extend(withPageError({ title: 'Could not load usage' }))
	.extend((I) => ({
		seeUsageContent: async () => {
			await I.see(usageLoc.heading)
			await I.see(usageLoc.breakdownHeading)
			await I.see(usageLoc.documentsRow)
			await I.see(usageLoc.mediaRow)
			await I.see(usageLoc.otherRow)
		},
	}))
