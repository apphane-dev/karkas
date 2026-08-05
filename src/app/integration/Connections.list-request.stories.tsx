import preview from '#.storybook/preview'
import { App } from '#app/App'
import { connectionList } from '#entities/connection/mocks/handlers'
import { connectionsActor as I } from '#pages/connections/testing'
import { role, text } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Connections/List Request',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'connections',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

const connectionListRetryHandler = connectionList.retrySucceeds()

export const HandlesConnectionsLoadServerError = meta.story({
	name: 'Connections Load Server Error',
	play: () => I.waitExit(role('status')),

	beforeEach({ msw }) {
		msw.use(connectionList.error)
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

	beforeEach({ msw }) {
		msw.use(connectionListRetryHandler)
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
	beforeEach: HandlesConnectionsLoadServerError.input.beforeEach,
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

	beforeEach({ msw }) {
		msw.use(connectionList.loading)
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
	beforeEach: KeepsLoadingWhenConnectionsRequestNeverResolves.input.beforeEach,
})

KeepsLoadingWhenConnectionsRequestNeverResolvesMobile.test(
	'[mobile] shows loading state while connections request is pending',
	async () => {
		await I.seeLoading()
	},
)
