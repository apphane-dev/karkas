import { button, createActor, heading, link, role, text } from '#shared/test'

export const chatLoc = {
	conversationErrorHeading: heading('Could not load conversations'),
	conversationErrorDescription: text("We couldn't load the conversations. Try again in a moment."),
	conversationDetailErrorHeading: heading('Could not load conversation'),
	conversationDetailErrorDescription: text(
		"We couldn't load this conversation. Try again in a moment.",
	),
	conversationNotFoundHeading: heading('Conversation not found'),
	messageThreadLoading: role('status', 'Loading message thread'),
}

export const chatActor = createActor().extend((I) => ({
	seeError: async () => {
		await I.see(chatLoc.conversationErrorHeading)
		await I.see(chatLoc.conversationErrorDescription)
		await I.see(role('alert'))
		await I.see(button('Try again'))
	},
	seeDetailError: async () => {
		await I.see(chatLoc.conversationDetailErrorHeading)
		await I.see(chatLoc.conversationDetailErrorDescription)
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
