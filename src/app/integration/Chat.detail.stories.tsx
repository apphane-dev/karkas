import preview from '#.storybook/preview'
import { App } from '#app/App'
import { CONVERSATIONS_API_PATH } from '#entities/conversation/api/conversationsApi'
import { conversationDetail, conversationSendMessage } from '#entities/conversation/mocks/handlers'
import { chatActor as I, chatLoc as loc } from '#pages/chat/testing'
import { link, role, text } from '#shared/test'
import {
	createRouteFetchAbortProbe,
	expectRouteFetchAbortOnNavigation,
	routeFetchAbortLifecycle,
} from '#shared/test/routeFetchAbortProbe'

const conversationDetailFetchAbortProbe = createRouteFetchAbortProbe(
	`${CONVERSATIONS_API_PATH}/1`,
	'conversation detail',
)

const meta = preview.meta({
	title: 'Integration/Chat/Detail',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'chat/1',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const AbortsPendingConversationDetailRequestOnNavigation = meta.story({
	name: 'Aborts Pending Conversation Detail Request On Navigation',
	beforeEach: routeFetchAbortLifecycle(conversationDetailFetchAbortProbe),
	parameters: {
		msw: {
			handlers: { conversationDetail: conversationDetail.loading },
		},
	},
})

AbortsPendingConversationDetailRequestOnNavigation.test(
	'aborts the pending conversation detail request when navigating away',
	async () => {
		await expectRouteFetchAbortOnNavigation(
			conversationDetailFetchAbortProbe,
			() => I.click(link('Timer')),
			{ assertLoading: () => I.see(role('status', 'Loading message thread')) },
		)
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
		await I.scope(role('main'), async () => {
			await I.seeDetailError()
		})
	},
)

HandlesConversationDetailServerError.test(
	'keeps detail error state when retry also fails',
	async () => {
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
		await I.scope(role('main'), async () => {
			await I.seeDetailError()
		})
	},
)

export const KeepsLoadingWhenConversationDetailNeverResolves = meta.story({
	name: 'Conversation Detail Loading State',
	parameters: {
		msw: {
			handlers: { conversationDetail: conversationDetail.loading },
		},
	},
})

KeepsLoadingWhenConversationDetailNeverResolves.test(
	'shows message thread loading state while conversation detail is pending',
	async () => {
		await I.see(loc.messageThreadLoading)
		await I.dontSee(loc.conversationNotFoundHeading)
	},
)

export const KeepsLoadingWhenConversationDetailNeverResolvesMobile = meta.story({
	name: 'Conversation Detail Loading State (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	parameters: KeepsLoadingWhenConversationDetailNeverResolves.input.parameters,
})

KeepsLoadingWhenConversationDetailNeverResolvesMobile.test(
	'[mobile] shows message thread loading state while conversation detail is pending',
	async () => {
		await I.see(loc.messageThreadLoading)
		await I.dontSee(loc.conversationNotFoundHeading)
	},
)

export const SendMessage = meta.story({
	name: 'Send Message',
	play: () => I.waitExit(role('status')),
})

SendMessage.test(
	'typing and sending adds the message to the thread and clears the input',
	async () => {
		await I.scope(role('main'), async () => {
			const before = await I.messageCount()
			await I.sendMessage('On my way to review it')
			await I.seeSentMessage('On my way to review it')
			await I.seeComposeCleared()
			await I.seeMessageCountIs(before + 1)
		})
	},
)

export const EmptySendIsIgnored = meta.story({
	name: 'Empty Send Ignored',
	play: () => I.waitExit(role('status')),
})

EmptySendIsIgnored.test('submitting an empty message does not add a bubble', async () => {
	await I.scope(role('main'), async () => {
		const before = await I.messageCount()
		await I.sendMessage('   ')
		// The submit handler still ran (draft cleared), yet no bubble was added.
		await I.seeComposeCleared()
		await I.seeMessageCountIs(before)
	})
})

export const SendServerError = meta.story({
	name: 'Send Server Error',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: { handlers: { conversationSendMessage: conversationSendMessage.error } },
	},
})

SendServerError.test(
	'send failure shows an error toast and removes the optimistic message',
	async () => {
		await I.scope(role('main'), async () => {
			const before = await I.messageCount()
			await I.sendMessage('this will fail')
			await I.seeSendErrorToast()
			await I.seeMessageCountIs(before)
		})
	},
)
