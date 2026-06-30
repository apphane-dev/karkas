import preview from '#.storybook/preview'
import { App } from '#app/App'
import { TIMELINE_EVENTS_API_PATH } from '#entities/timeline-event/api/timelineEventsApi'
import { timelineEventList } from '#entities/timeline-event/mocks/handlers'
import { timelineActor as I } from '#pages/timeline/testing'
import { link, role, text } from '#shared/test'
import {
	createRouteFetchAbortProbe,
	expectRouteFetchAbortOnNavigation,
	routeFetchAbortLifecycle,
} from '#shared/test/routeFetchAbortProbe'

const timelineFetchAbortProbe = createRouteFetchAbortProbe(TIMELINE_EVENTS_API_PATH, 'timeline')

const meta = preview.meta({
	title: 'Integration/Timeline',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'timeline',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({
	name: 'Default',
	play: () => I.waitExit(role('status')),
})

Default.test('renders timeline events', async () => {
	await I.seeTimelineEvents()
})

Default.test('shows date groups', async () => {
	await I.seeDateGroups()
})

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	play: () => I.waitExit(role('status')),
})

DefaultMobile.test('[mobile] renders timeline events', async () => {
	await I.seeTimelineEvents()
})

DefaultMobile.test('[mobile] shows date groups', async () => {
	await I.seeDateGroups()
})

export const AbortsPendingTimelineRequestOnNavigation = meta.story({
	name: 'Aborts Pending Timeline Request On Navigation',
	beforeEach: routeFetchAbortLifecycle(timelineFetchAbortProbe),
	parameters: {
		msw: {
			handlers: { timelineEventList: timelineEventList.loading },
		},
	},
})

AbortsPendingTimelineRequestOnNavigation.test(
	'aborts the pending timeline request when navigating away',
	async () => {
		await expectRouteFetchAbortOnNavigation(timelineFetchAbortProbe, () => I.click(link('Timer')), {
			assertLoading: () => I.seeLoading(),
		})
	},
)

export const HandlesTimelineLoadServerError = meta.story({
	name: 'Timeline Load Server Error',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { timelineEventList: timelineEventList.error },
		},
	},
})

HandlesTimelineLoadServerError.test('shows error state when timeline request fails', async () => {
	await I.seeError()
	await I.see(text("We couldn't load the timeline data. Try again in a moment."))
})

HandlesTimelineLoadServerError.test('keeps error state when retry also fails', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.seeError()
})

export const RecoversAfterTimelineLoadRetry = meta.story({
	name: 'Timeline Load Retry Success',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { timelineEventList: timelineEventList.retrySucceeds() },
		},
	},
})

RecoversAfterTimelineLoadRetry.test('loads timeline after retry succeeds', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.see(text('Deployed v2.4.1 to production').wait())
	await I.seeTimelineEvents()
})

export const HandlesTimelineLoadServerErrorMobile = meta.story({
	name: 'Timeline Load Server Error (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: HandlesTimelineLoadServerError.input.parameters,
	play: () => I.waitExit(role('status')),
})

HandlesTimelineLoadServerErrorMobile.test(
	'[mobile] shows error state when timeline request fails',
	async () => {
		await I.seeError()
		await I.see(text("We couldn't load the timeline data. Try again in a moment."))
	},
)

export const KeepsLoadingWhenTimelineRequestNeverResolves = meta.story({
	name: 'Timeline Request Loading State',
	parameters: {
		msw: {
			handlers: { timelineEventList: timelineEventList.loading },
		},
	},
})

KeepsLoadingWhenTimelineRequestNeverResolves.test(
	'keeps loading state for pending timeline request',
	async () => {
		await I.seeLoading()
	},
)

export const KeepsLoadingWhenTimelineRequestNeverResolvesMobile = meta.story({
	name: 'Timeline Request Loading State (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: KeepsLoadingWhenTimelineRequestNeverResolves.input.parameters,
})

KeepsLoadingWhenTimelineRequestNeverResolvesMobile.test(
	'[mobile] keeps loading state for pending timeline request',
	async () => {
		await I.seeLoading()
	},
)
