import { assertNoRouteLoaderAbortErrors } from '#.storybook/abortErrorGuard'
import preview from '#.storybook/preview'
import { App } from '#app/App'
import { CONNECTIONS_API_PATH } from '#entities/connection/api/connectionsApi'
import { connectionList } from '#entities/connection/mocks/handlers'
import { connectionsActor as I } from '#pages/connections/testing'
import { heading, link, role, text } from '#shared/test'
import {
	createRouteFetchAbortProbe,
	expectRouteFetchAbortOnNavigation,
	routeFetchAbortLifecycle,
} from '#shared/test/routeFetchAbortProbe'

const connectionsFetchAbortProbe = createRouteFetchAbortProbe(CONNECTIONS_API_PATH, 'connections')

const meta = preview.meta({
	title: 'Integration/Connections/List',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'connections',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

const assertExpectedDetailTeardown = async () => {
	await assertNoRouteLoaderAbortErrors('connectionDetail')
}

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
	await I.goBack()
	await I.see(role('list', 'Connections').wait())
	await assertExpectedDetailTeardown()
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

	await I.goBack()
	await I.see(role('list', 'Connections').wait())
	await assertExpectedDetailTeardown()
})

Default.test('displays correct status badges for all statuses', async () => {
	await I.seeStatusBadges()
})

Default.test('displays correct type badges for all types', async () => {
	await I.seeTypeBadges()
})

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	play: () => I.waitExit(role('status')),
})

export const AbortsPendingConnectionsRequestOnNavigation = meta.story({
	name: 'Aborts Pending Connections Request On Navigation',
	beforeEach: routeFetchAbortLifecycle(connectionsFetchAbortProbe),
	parameters: {
		msw: {
			handlers: { connectionList: connectionList.loading },
		},
	},
})

AbortsPendingConnectionsRequestOnNavigation.test(
	'aborts the pending connections request when navigating away',
	async () => {
		await expectRouteFetchAbortOnNavigation(
			connectionsFetchAbortProbe,
			() => I.click(link('Timer')),
			{ assertLoading: () => I.seeLoading() },
		)
	},
)

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
	await I.goBack()
	await I.see(role('list', 'Connections').wait())
	await assertExpectedDetailTeardown()
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

	await I.goBack()
	await I.see(role('list', 'Connections').wait())
	await assertExpectedDetailTeardown()
})

DefaultMobile.test('[mobile] displays correct status badges for all statuses', async () => {
	await I.seeStatusBadges()
})

DefaultMobile.test('[mobile] displays correct type badges for all types', async () => {
	await I.seeTypeBadges()
})

export const SearchConnections = meta.story({
	name: 'Search Connections',
	play: () => I.waitExit(role('status')),
})

SearchConnections.test('typing a query filters by name', async () => {
	await I.search('stripe')
	await I.seeConnectionInList(/Stripe API/i)
	await I.dontSeeConnectionInList(/Analytics DB/i)
	await I.dontSeeConnectionInList(/Slack Notifications/i)
})

SearchConnections.test('search matches description', async () => {
	await I.search('webhook')
	await I.seeConnectionInList(/Slack Notifications/i)
	await I.dontSeeConnectionInList(/Stripe API/i)
})

SearchConnections.test('search is case-insensitive', async () => {
	await I.search('ANALYTICS')
	await I.seeConnectionInList(/Analytics DB/i)
})

SearchConnections.test('clearing restores the full list', async () => {
	await I.search('stripe')
	await I.dontSeeConnectionInList(/Analytics DB/i)
	await I.clearSearch()
	await I.seeConnectionInList(/Stripe API/i)
	await I.seeConnectionInList(/Analytics DB/i)
})

SearchConnections.test('no results shows nothing matching', async () => {
	await I.search('zzzznomatch')
	await I.dontSeeConnectionInList(/Stripe API/i)
	await I.dontSeeConnectionInList(/S3 Data Lake/i)
})
