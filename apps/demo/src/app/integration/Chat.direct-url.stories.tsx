import preview from '#.storybook/preview'
import { App } from '#app/App'
import { chatActor as I } from '#pages/chat/testing'
import { role } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Chat/Direct URL',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'chat/missing-42',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const DirectUrlNotFound = meta.story({
	name: 'Direct URL to Missing Conversation',
	play: () => I.waitExit(role('status')),
})

DirectUrlNotFound.test('shows not-found state for missing conversation URL', async () => {
	await I.scope(role('main'), async () => {
		await I.seeConversationNotFound('missing-42')
	})
})
