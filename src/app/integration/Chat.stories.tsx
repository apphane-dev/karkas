import preview from '#.storybook/preview'
import { App } from '#app/App'
import { conversationDetail, conversationList } from '#entities/conversation/mocks/handlers'
import { chatActor as I, chatLoc as loc } from '#pages/chat/testing'
import { link, role, text } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Chat',
	component: App,
	parameters: { layout: 'fullscreen', initialPath: 'chat' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({
	name: 'Default',
	play: () => I.waitExit(role('status')),
})

Default.test('renders conversation list', async () => {
	await I.seeConversationList()
})

Default.test('shows no-selection message when no conversation selected', async () => {
	await I.see(text('No conversation selected'))
})

Default.test('shows message thread when conversation is clicked', async () => {
	await I.click(link(/Engineering/))
	await I.waitExit(role('status'))

	await I.scope(role('main'), async () => {
		await I.see(text('Has anyone looked at the failing CI on main?'))
	})
})

export const DirectUrlNotFound = meta.story({
	name: 'Direct URL to Missing Conversation',
	parameters: { initialPath: 'chat/missing-42' },
	play: () => I.waitExit(role('status')),
})

DirectUrlNotFound.test('shows not-found state for missing conversation URL', async () => {
	await I.scope(role('main'), async () => {
		await I.seeConversationNotFound('missing-42')
	})
})

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	play: () => I.waitExit(role('status')),
})

DefaultMobile.test('[mobile] renders conversation list', async () => {
	await I.seeConversationList()
})

DefaultMobile.test('[mobile] shows message thread when conversation is clicked', async () => {
	await I.click(link(/Engineering/))
	await I.waitExit(role('status'))

	await I.scope(role('main'), async () => {
		await I.see(text('Has anyone looked at the failing CI on main?'))
	})
})

DefaultMobile.test('[mobile] can navigate back to conversation list', async () => {
	await I.click(link(/Engineering/))
	await I.waitExit(role('status'))
	await I.goBack()
	await I.see(link(/Engineering/))
})

export const HandlesChatLoadServerError = meta.story({
	name: 'Conversations Load Server Error',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { conversationList: conversationList.error },
		},
	},
})

HandlesChatLoadServerError.test('shows error state when conversations request fails', async () => {
	await I.seeError()
})

HandlesChatLoadServerError.test('keeps error state when retry also fails', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.seeError()
})

export const RecoversAfterChatLoadRetry = meta.story({
	name: 'Conversations Load Retry Success',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { conversationList: conversationList.retrySucceeds() },
		},
	},
})

RecoversAfterChatLoadRetry.test('loads conversations after retry succeeds', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.see(role('list', 'Chat').wait())
	await I.seeConversationList()
})

export const HandlesChatLoadServerErrorMobile = meta.story({
	name: 'Conversations Load Server Error (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: HandlesChatLoadServerError.input.parameters,
	play: () => I.waitExit(role('status')),
})

HandlesChatLoadServerErrorMobile.test(
	'[mobile] shows error state when conversations request fails',
	async () => {
		await I.seeError()
	},
)

export const KeepsLoadingWhenChatRequestNeverResolves = meta.story({
	name: 'Conversations Request Loading State',
	parameters: {
		msw: {
			handlers: { conversationList: conversationList.loading },
		},
	},
})

KeepsLoadingWhenChatRequestNeverResolves.test(
	'keeps loading state for pending conversations request',
	async () => {
		await I.seeLoading()
	},
)

export const KeepsLoadingWhenChatRequestNeverResolvesMobile = meta.story({
	name: 'Conversations Request Loading State (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: KeepsLoadingWhenChatRequestNeverResolves.input.parameters,
})

KeepsLoadingWhenChatRequestNeverResolvesMobile.test(
	'[mobile] keeps loading state for pending conversations request',
	async () => {
		await I.seeLoading()
	},
)

export const HandlesConversationDetailServerError = meta.story({
	name: 'Conversation Detail Server Error',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { conversationDetail: conversationDetail.error },
		},
	},
})

HandlesConversationDetailServerError.test(
	'shows error state when conversation detail request fails',
	async () => {
		await I.click(link(/Engineering/))
		await I.waitExit(role('status'))

		await I.scope(role('main'), async () => {
			await I.seeDetailError()
		})
	},
)

HandlesConversationDetailServerError.test(
	'keeps detail error state when retry also fails',
	async () => {
		await I.click(link(/Engineering/))
		await I.waitExit(role('status'))

		await I.scope(role('main'), async () => {
			await I.seeDetailError()
			await I.retry()
			await I.waitExit(role('status'))
			await I.seeDetailError()
		})
	},
)

export const RecoversAfterConversationDetailRetry = meta.story({
	name: 'Conversation Detail Retry Success',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { conversationDetail: conversationDetail.retrySucceeds() },
		},
	},
})

RecoversAfterConversationDetailRetry.test(
	'loads conversation detail after retry succeeds',
	async () => {
		await I.click(link(/Engineering/))
		await I.waitExit(role('status'))

		await I.scope(role('main'), async () => {
			await I.seeDetailError()
			await I.retry()
			await I.waitExit(role('status'))
			await I.see(text('Has anyone looked at the failing CI on main?').wait())
		})
	},
)

export const HandlesConversationDetailServerErrorMobile = meta.story({
	name: 'Conversation Detail Server Error (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: HandlesConversationDetailServerError.input.parameters,
	play: () => I.waitExit(role('status')),
})

HandlesConversationDetailServerErrorMobile.test(
	'[mobile] shows error state when conversation detail request fails',
	async () => {
		await I.click(link(/Engineering/))
		await I.waitExit(role('status'))

		await I.scope(role('main'), async () => {
			await I.seeDetailError()
		})
	},
)

export const KeepsLoadingWhenConversationDetailNeverResolves = meta.story({
	name: 'Conversation Detail Loading State',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: {
			handlers: { conversationDetail: conversationDetail.loading },
		},
	},
})

KeepsLoadingWhenConversationDetailNeverResolves.test(
	'shows message thread loading state while conversation detail is pending',
	async () => {
		await I.click(link(/Engineering/))

		const detail = await I.see(role('main'))
		await I.see(loc.messageThreadLoading.within(detail))
		await I.dontSee(loc.conversationNotFoundHeading.within(detail))
	},
)

export const KeepsLoadingWhenConversationDetailNeverResolvesMobile = meta.story({
	name: 'Conversation Detail Loading State (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: KeepsLoadingWhenConversationDetailNeverResolves.input.parameters,
	play: () => I.waitExit(role('status')),
})

KeepsLoadingWhenConversationDetailNeverResolvesMobile.test(
	'[mobile] shows message thread loading state while conversation detail is pending',
	async () => {
		await I.click(link(/Engineering/))

		const detail = await I.see(role('main'))
		await I.see(loc.messageThreadLoading.within(detail))
		await I.dontSee(loc.conversationNotFoundHeading.within(detail))
	},
)
