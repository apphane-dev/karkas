import { button, createActor, heading, link, role } from '#shared/test'

export const chatLoc = {
	conversationErrorHeading: heading('Could not load conversations'),
	conversationNotFoundHeading: heading('Conversation not found'),
	messageThreadLoading: role('status', 'Loading message thread'),
}

export const chatActor = createActor().extend((I) => ({
	seeError: async () => {
		await I.see(heading('Could not load conversations'))
		await I.see(role('alert'))
		await I.see(button('Try again'))
	},
	seeLoading: async () => {
		await I.see(role('status', 'Loading conversations page'))
		await I.dontSee(role('alert'))
	},
	goBack: async () => {
		await I.click((canvas) => canvas.findByLabelText('Back to conversations'))
	},
	seeConversationList: async () => {
		await I.scope(role('list', 'Chat'), async () => {
			await I.see(link(/Engineering/i))
			await I.see(link(/Alex Johnson/i))
		})
	},
}))
