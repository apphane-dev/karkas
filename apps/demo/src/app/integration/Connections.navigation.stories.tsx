import { assertNoRouteLoaderAbortErrors } from '#.storybook/abortErrorGuard'
import preview from '#.storybook/preview'
import { App } from '#app/App'
import { connectionsActor as I } from '#pages/connections/testing'
import { heading, link, role } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Connections/Navigation',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'connections',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const SwitchBetweenConnections = meta.story({
	name: 'Switch Between Connections',
	play: () => I.waitExit(role('status')),
})

SwitchBetweenConnections.test('can switch from one connection detail to another', async () => {
	await I.click(link(/Stripe API/i))
	await I.waitExit(role('status'))
	await I.see(heading('Stripe API'))

	await I.click(link(/Analytics DB/i))
	await I.waitExit(role('status'))
	await I.see(heading('Analytics DB'))
})

export const SwitchBetweenConnectionsMobile = meta.story({
	name: 'Switch Between Connections (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	play: () => I.waitExit(role('status')),
})

SwitchBetweenConnectionsMobile.test(
	'[mobile] can switch to another connection after navigating back',
	async () => {
		await I.click(link(/Stripe API/i))
		await I.waitExit(role('status'))
		await I.see(heading('Stripe API'))

		await I.goBack()
		await I.see(role('list', 'Connections').wait())
		await assertNoRouteLoaderAbortErrors('connectionDetail')

		await I.click(link(/Analytics DB/i))
		await I.waitExit(role('status'))
		await I.see(heading('Analytics DB'))
	},
)
