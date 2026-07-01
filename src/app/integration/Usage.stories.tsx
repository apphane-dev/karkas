import preview from '#.storybook/preview'
import { App } from '#app/App'
import { USAGE_API_PATH } from '#entities/usage/api/usageApi'
import { usageStats } from '#entities/usage/mocks/handlers'
import { usageActor as I, usageLoc as loc } from '#pages/usage/testing'
import { link, role, text } from '#shared/test'
import {
	createRouteFetchAbortProbe,
	expectRouteFetchAbortOnNavigation,
	routeFetchAbortLifecycle,
} from '#shared/test/routeFetchAbortProbe'

const usageFetchAbortProbe = createRouteFetchAbortProbe(USAGE_API_PATH, 'usage')

const meta = preview.meta({
	title: 'Integration/Usage',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'usage',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({
	name: 'Default',
	play: () => I.waitExit(role('status')),
})

Default.test('renders usage heading', async () => {
	await I.see(loc.heading)
})

Default.test('renders storage reset note', async () => {
	await I.see(loc.storageResetNote)
})

Default.test('renders breakdown and insights sections', async () => {
	await I.see(loc.breakdownHeading)
	await I.see(loc.documentsRow)
	await I.see(loc.mediaRow)
	await I.see(loc.otherRow)
	await I.see(loc.insightsHeading)
	await I.see(loc.recommendedCleanup)
})

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	play: () => I.waitExit(role('status')),
})

DefaultMobile.test('[mobile] renders usage heading', async () => {
	await I.see(loc.heading)
})

DefaultMobile.test('[mobile] renders usage content', async () => {
	await I.seeUsageContent()
})

export const AbortsPendingUsageRequestOnNavigation = meta.story({
	name: 'Aborts Pending Usage Request On Navigation',
	beforeEach: routeFetchAbortLifecycle(usageFetchAbortProbe),
	parameters: {
		msw: {
			handlers: { usageStats: usageStats.loading },
		},
	},
})

AbortsPendingUsageRequestOnNavigation.test(
	'aborts the pending usage request when navigating away',
	async () => {
		await expectRouteFetchAbortOnNavigation(usageFetchAbortProbe, () => I.click(link('Timer')), {
			assertLoading: () => I.seeLoading(),
		})
	},
)

export const HandlesUsageLoadServerError = meta.story({
	name: 'Usage Load Server Error',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { usageStats: usageStats.error },
		},
	},
})

HandlesUsageLoadServerError.test('shows error state when usage request fails', async () => {
	await I.seeError()
	await I.see(text("We couldn't load the usage data. Try again in a moment."))
})

HandlesUsageLoadServerError.test('keeps error state when retry also fails', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.seeError()
})

export const RecoversAfterUsageLoadRetry = meta.story({
	name: 'Usage Load Retry Success',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { usageStats: usageStats.retrySucceeds() },
		},
	},
})

RecoversAfterUsageLoadRetry.test('loads usage data after retry succeeds', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.see(loc.heading.wait())
	await I.seeUsageContent()
})

export const KeepsLoadingWhenUsageRequestNeverResolves = meta.story({
	name: 'Usage Request Loading State',
	parameters: {
		msw: {
			handlers: { usageStats: usageStats.loading },
		},
	},
})

KeepsLoadingWhenUsageRequestNeverResolves.test(
	'keeps loading state for pending usage request',
	async () => {
		await I.seeLoading()
	},
)
