import preview from '#.storybook/preview'
import { App } from '#app/App'
import { connectionDetail, connectionList } from '#entities/connection/mocks/handlers'
import { connectionsActor as I, connectionsLoc as loc } from '#pages/connections/testing'
import { heading, link, role, text } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Connections',
	component: App,
	parameters: { layout: 'fullscreen', initialPath: 'connections' },
	loaders: [(ctx) => void I.init(ctx)],
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
			await I.see(heading('Could not load connection'))
			await I.see(text("We couldn't load this connection. Try again in a moment."))
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
			await I.see(heading('Could not load connection'))
			await I.see(text("We couldn't load this connection. Try again in a moment."))
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
