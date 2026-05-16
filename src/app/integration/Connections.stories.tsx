import preview from '#.storybook/preview'
import { App } from '#app/App'
import { connectionDetail, connectionList } from '#entities/connection/mocks/handlers'
import { connectionsActor as I, connectionsLoc as loc } from '#pages/connections/testing'
import { button, heading, link, role, text } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Connections',
	component: App,
	parameters: { layout: 'fullscreen', initialPath: 'connections' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({
	name: 'Default',
	play: () => I.waitExit(role('status')),
})

Default.test('renders connection list with all connections', async () => {
	await I.seeConnectionList()
})

Default.test('shows no-selection message when no connection selected', async () => {
	await I.see(text('No connection selected'))
})

Default.test('shows connection detail when connection is clicked', async () => {
	await I.click(link(/Stripe API/i))
	await I.waitExit(role('status'))
	await I.see(heading('Stripe API'))
})

Default.test('shows all detail paragraphs in connection detail', async () => {
	await I.click(link(/Stripe API/i))
	await I.waitExit(role('status'))

	await I.scope(role('main'), async () => {
		await I.see(heading(/Stripe API/i))
		await I.see(text(/Connected to Stripe API v2023-10-16/))
		await I.see(text(/Webhook endpoint configured/))
		await I.see(text(/Average response latency/))
		await I.see(text(/Rate limit headroom/))
	})
})

Default.test('displays correct status badges for all statuses', async () => {
	await I.seeStatusBadges()
})

Default.test('displays correct type badges for all types', async () => {
	await I.seeTypeBadges()
})

Default.test('can select different connections', async () => {
	await I.click(link(/Stripe API/i))
	await I.waitExit(role('status'))
	await I.see(heading('Stripe API'))

	await I.click(link(/Analytics DB/i))
	await I.waitExit(role('status'))
	await I.see(heading('Analytics DB'))
})

export const DirectUrlNotFound = meta.story({
	name: 'Direct URL to Missing Connection',
	parameters: { initialPath: 'connections/missing-42' },
	play: () => I.waitExit(role('status')),
})

DirectUrlNotFound.test('shows not-found state for missing connection URL', async () => {
	await I.scope(role('main'), async () => {
		await I.seeConnectionNotFound('missing-42')
	})
})

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	play: () => I.waitExit(role('status')),
})

DefaultMobile.test('[mobile] renders connection list with all connections', async () => {
	await I.seeConnectionList()
})

DefaultMobile.test('[mobile] shows connection list when no connection is selected', async () => {
	await I.seeConnectionList()
})

DefaultMobile.test('[mobile] shows connection detail when connection is clicked', async () => {
	await I.click(link(/Stripe API/i))
	await I.waitExit(role('status'))
	await I.see(heading('Stripe API'))
})

DefaultMobile.test('[mobile] shows all detail paragraphs in connection detail', async () => {
	await I.click(link(/Stripe API/i))
	await I.waitExit(role('status'))

	await I.scope(role('main'), async () => {
		await I.see(heading(/Stripe API/i))
		await I.see(text(/Connected to Stripe API v2023-10-16/))
		await I.see(text(/Webhook endpoint configured/))
		await I.see(text(/Average response latency/))
		await I.see(text(/Rate limit headroom/))
	})
})

DefaultMobile.test('[mobile] displays correct status badges for all statuses', async () => {
	await I.seeStatusBadges()
})

DefaultMobile.test('[mobile] displays correct type badges for all types', async () => {
	await I.seeTypeBadges()
})

DefaultMobile.test('[mobile] can select different connections', async () => {
	await I.click(link(/Stripe API/i))
	await I.waitExit(role('status'))
	await I.see(heading('Stripe API'))

	await I.goBack()

	await I.click(link(/Analytics DB/i))
	await I.waitExit(role('status'))
	await I.see(heading('Analytics DB'))
})

export const HandlesConnectionsLoadServerError = meta.story({
	name: 'Connections Load Server Error',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { connectionList: connectionList.error },
		},
	},
})

HandlesConnectionsLoadServerError.test(
	'shows error state when connections request fails',
	async () => {
		await I.seeError()
		await I.see(text("We couldn't load the connection list. Try again in a moment."))
	},
)

HandlesConnectionsLoadServerError.test('keeps error state when retry also fails', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.seeError()
})

export const RecoversAfterConnectionsLoadRetry = meta.story({
	name: 'Connections Load Retry Success',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { connectionList: connectionList.retrySucceeds() },
		},
	},
})

RecoversAfterConnectionsLoadRetry.test('loads connection list after retry succeeds', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.see(role('list', 'Connections').wait())
	await I.seeConnectionList()
})

export const HandlesConnectionsLoadServerErrorMobile = meta.story({
	name: 'Connections Load Server Error (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: HandlesConnectionsLoadServerError.input.parameters,
	play: () => I.waitExit(role('status')),
})

HandlesConnectionsLoadServerErrorMobile.test(
	'[mobile] shows error state when connections request fails',
	async () => {
		await I.seeError()
		await I.see(text("We couldn't load the connection list. Try again in a moment."))
	},
)

export const KeepsLoadingWhenConnectionsRequestNeverResolves = meta.story({
	name: 'Connections Request Loading State',
	parameters: {
		msw: {
			handlers: { connectionList: connectionList.loading },
		},
	},
})

KeepsLoadingWhenConnectionsRequestNeverResolves.test(
	'shows loading state while connections request is pending',
	async () => {
		await I.seeLoading()
	},
)

export const KeepsLoadingWhenConnectionsRequestNeverResolvesMobile = meta.story({
	name: 'Connections Request Loading State (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: KeepsLoadingWhenConnectionsRequestNeverResolves.input.parameters,
})

KeepsLoadingWhenConnectionsRequestNeverResolvesMobile.test(
	'[mobile] shows loading state while connections request is pending',
	async () => {
		await I.seeLoading()
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
		await I.click(link(/Stripe API/i))
		await I.waitExit(role('status'))

		await I.scope(role('main'), async () => {
			await I.seeDetailError()
		})
	},
)

HandlesConnectionDetailServerError.test(
	'keeps detail error state when retry also fails',
	async () => {
		await I.click(link(/Stripe API/i))
		await I.waitExit(role('status'))

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
		await I.click(link(/Stripe API/i))
		await I.waitExit(role('status'))

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
		await I.click(link(/Stripe API/i))
		await I.waitExit(role('status'))

		await I.scope(role('main'), async () => {
			await I.seeDetailError()
		})
	},
)

export const KeepsLoadingWhenConnectionDetailNeverResolves = meta.story({
	name: 'Connection Detail Loading State',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { connectionDetail: connectionDetail.loading },
		},
	},
})

KeepsLoadingWhenConnectionDetailNeverResolves.test(
	'shows detail loading state while connection detail is pending',
	async () => {
		await I.click(link(/Stripe API/i))

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
	play: () => I.waitExit(role('status')),
})

KeepsLoadingWhenConnectionDetailNeverResolvesMobile.test(
	'[mobile] shows detail loading state while connection detail is pending',
	async () => {
		await I.click(link(/Stripe API/i))

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
	await I.click(link(/Stripe API/i))
	await I.waitExit(role('status'))

	await I.see(button('Test connection'))
	await I.click(button('Test connection'))
	await I.seeTestConnectionToast()
})

export const ReconnectErrorConnection = meta.story({
	name: 'Reconnect Error Status Connection',
	play: () => I.waitExit(role('status')),
})

ReconnectErrorConnection.test('error-status connection shows Reconnect button', async () => {
	await I.click(link(/Auth0 SSO/i))
	await I.waitExit(role('status'))

	await I.scope(role('main'), async () => {
		await I.see(button('Reconnect'))
	})
})

ReconnectErrorConnection.test('clicking Reconnect shows success toast', async () => {
	await I.click(link(/Auth0 SSO/i))
	await I.waitExit(role('status'))

	await I.click(button('Reconnect'))
	await I.seeReconnectToast()
})

ReconnectErrorConnection.test('active connection does not show Reconnect button', async () => {
	await I.click(link(/Stripe API/i))
	await I.waitExit(role('status'))

	await I.scope(role('main'), async () => {
		await I.dontSee(button('Reconnect'))
	})
})
