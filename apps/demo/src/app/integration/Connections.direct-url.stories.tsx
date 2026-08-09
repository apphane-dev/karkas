import preview from '#.storybook/preview'
import { App } from '#app/App'
import { connectionsActor as I } from '#pages/connections/testing'
import { role } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Connections/Direct URL',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'connections/missing-42',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const MissingConnection = meta.story({
	name: 'Missing Connection',
	play: () => I.waitExit(role('status')),
})

MissingConnection.test('shows not-found state for missing connection URL', async () => {
	await I.scope(role('main'), async () => {
		await I.seeConnectionNotFound('missing-42')
	})
})
