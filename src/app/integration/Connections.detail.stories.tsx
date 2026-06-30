import preview from '#.storybook/preview'
import { App } from '#app/App'
import { CONNECTIONS_API_PATH } from '#entities/connection/api/connectionsApi'
import { connectionDetail } from '#entities/connection/mocks/handlers'
import { connectionsActor as I, connectionsLoc as loc } from '#pages/connections/testing'
import { button, heading, link, role, text } from '#shared/test'
import {
	createRouteFetchAbortProbe,
	expectRouteFetchAbortOnNavigation,
	routeFetchAbortLifecycle,
} from '#shared/test/routeFetchAbortProbe'

const connectionDetailFetchAbortProbe = createRouteFetchAbortProbe(
	`${CONNECTIONS_API_PATH}/1`,
	'connection detail',
)

const meta = preview.meta({
	title: 'Integration/Connections/Detail',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'connections/1',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const AbortsPendingConnectionDetailRequestOnNavigation = meta.story({
	name: 'Aborts Pending Connection Detail Request On Navigation',
	beforeEach: routeFetchAbortLifecycle(connectionDetailFetchAbortProbe),
	parameters: {
		msw: {
			handlers: { connectionDetail: connectionDetail.loading },
		},
	},
})

AbortsPendingConnectionDetailRequestOnNavigation.test(
	'aborts the pending connection detail request when navigating away',
	async () => {
		await expectRouteFetchAbortOnNavigation(
			connectionDetailFetchAbortProbe,
			() => I.click(link('Timer')),
			{ assertLoading: () => I.see(role('status', 'Loading connection detail')) },
		)
	},
)

export const HandlesConnectionDetailServerError = meta.story({
	name: 'Connection Detail Server Error',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { connectionDetail: connectionDetail.error },
		},
	},
})

HandlesConnectionDetailServerError.test(
	'shows error state when connection detail request fails',
	async () => {
		await I.scope(role('main'), async () => {
			await I.seeDetailError()
		})
	},
)

HandlesConnectionDetailServerError.test(
	'keeps detail error state when retry also fails',
	async () => {
		await I.scope(role('main'), async () => {
			await I.seeDetailError()
			await I.retry()
			await I.waitExit(role('status'))
			await I.seeDetailError()
		})
	},
)

export const RecoversAfterConnectionDetailRetry = meta.story({
	name: 'Connection Detail Retry Success',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { connectionDetail: connectionDetail.retrySucceeds() },
		},
	},
})

RecoversAfterConnectionDetailRetry.test(
	'loads connection detail after retry succeeds',
	async () => {
		await I.scope(role('main'), async () => {
			await I.seeDetailError()
			await I.retry()
			await I.waitExit(role('status'))
			await I.see(heading('Stripe API').wait())
		})
	},
)

export const HandlesConnectionDetailServerErrorMobile = meta.story({
	name: 'Connection Detail Server Error (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: HandlesConnectionDetailServerError.input.parameters,
	play: () => I.waitExit(role('status')),
})

HandlesConnectionDetailServerErrorMobile.test(
	'[mobile] shows error state when connection detail request fails',
	async () => {
		await I.scope(role('main'), async () => {
			await I.seeDetailError()
		})
	},
)

export const KeepsLoadingWhenConnectionDetailNeverResolves = meta.story({
	name: 'Connection Detail Loading State',
	parameters: {
		msw: {
			handlers: { connectionDetail: connectionDetail.loading },
		},
	},
})

KeepsLoadingWhenConnectionDetailNeverResolves.test(
	'shows detail loading state while connection detail is pending',
	async () => {
		const detail = await I.see(role('main'))
		await I.see(loc.detailLoading.within(detail))
		await I.dontSee(heading('Stripe API').within(detail))
		await I.dontSee(text('Connection not found').within(detail))
	},
)

export const KeepsLoadingWhenConnectionDetailNeverResolvesMobile = meta.story({
	name: 'Connection Detail Loading State (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: KeepsLoadingWhenConnectionDetailNeverResolves.input.parameters,
})

KeepsLoadingWhenConnectionDetailNeverResolvesMobile.test(
	'[mobile] shows detail loading state while connection detail is pending',
	async () => {
		const detail = await I.see(role('main'))
		await I.see(loc.detailLoading.within(detail))
		await I.dontSee(heading('Stripe API').within(detail))
		await I.dontSee(text('Connection not found').within(detail))
	},
)

export const TestConnectionButton = meta.story({
	name: 'Test Connection Button',
	play: () => I.waitExit(role('status')),
})

TestConnectionButton.test('clicking Test Connection shows success toast', async () => {
	await I.see(button('Test connection'))
	await I.click(button('Test connection'))
	await I.seeTestConnectionToast()
})

export const ReconnectErrorConnection = meta.story({
	name: 'Reconnect Error Status Connection',
	parameters: { initialPath: 'connections/4' },
	play: () => I.waitExit(role('status')),
})

ReconnectErrorConnection.test('error-status connection shows Reconnect button', async () => {
	await I.scope(role('main'), async () => {
		await I.see(button('Reconnect'))
	})
})

ReconnectErrorConnection.test('clicking Reconnect shows success toast', async () => {
	await I.click(button('Reconnect'))
	await I.seeReconnectToast()
})

ReconnectErrorConnection.test('active connection does not show Reconnect button', async () => {
	await I.goBack()
	await I.see(role('list', 'Connections').wait())
	await I.click(role('link', /Stripe API/))
	await I.waitExit(role('status'))

	await I.scope(role('main'), async () => {
		await I.dontSee(button('Reconnect'))
	})
})
