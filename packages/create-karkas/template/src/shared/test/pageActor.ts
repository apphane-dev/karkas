import { button, heading, role, text, type BaseActor } from 'kahraman'

type LocatorName = string | RegExp

type PageErrorExpectation = {
	title: LocatorName
	description?: LocatorName
}

const seePageError = async (I: Pick<BaseActor, 'see'>, error: PageErrorExpectation) => {
	await I.see(heading(error.title))
	if (error.description !== undefined) await I.see(text(error.description))
	await I.see(role('alert'))
	await I.see(button('Try again'))
}

export const withPageError = (error: PageErrorExpectation) => (I: Pick<BaseActor, 'see'>) => ({
	seeError: () => seePageError(I, error),
})

export const withDetailError = (error: PageErrorExpectation) => (I: Pick<BaseActor, 'see'>) => ({
	seeDetailError: () => seePageError(I, error),
})

export const withRetryAndLoading =
	(loadingLabel: string) => (I: Pick<BaseActor, 'click' | 'dontSee' | 'see'>) => ({
		retry: () => I.click(button('Try again')),
		seeLoading: async () => {
			await I.see(role('status', loadingLabel))
			await I.dontSee(role('alert'))
		},
	})
