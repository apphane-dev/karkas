import { assertNoRouteLoaderAbortErrors } from '#.storybook/abortErrorGuard'
import preview from '#.storybook/preview'
import { App } from '#app/App'
import { CONVERSATIONS_API_PATH } from '#entities/conversation/api/conversationsApi'
import { conversationList } from '#entities/conversation/mocks/handlers'
import { chatActor as I } from '#pages/chat/testing'
import { link, role, text } from '#shared/test'
import {
	createRouteFetchAbortProbe,
	expectRouteFetchAbortOnNavigation,
	routeFetchAbortLifecycle,
} from '#shared/test/routeFetchAbortProbe'

const conversationsFetchAbortProbe = createRouteFetchAbortProbe(
	CONVERSATIONS_API_PATH,
	'conversations',
)

const meta = preview.meta({
	title: 'Integration/Chat/List',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'chat',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

const assertExpectedDetailTeardown = async () => {
	await assertNoRouteLoaderAbortErrors('chatConversation')
}

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

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	play: () => I.waitExit(role('status')),
})

export const AbortsPendingConversationsRequestOnNavigation = meta.story({
	name: 'Aborts Pending Conversations Request On Navigation',
	beforeEach: routeFetchAbortLifecycle(conversationsFetchAbortProbe),
	parameters: {
		msw: {
			handlers: { conversationList: conversationList.loading },
		},
	},
})

AbortsPendingConversationsRequestOnNavigation.test(
	'aborts the pending conversations request when navigating away',
	async () => {
		await expectRouteFetchAbortOnNavigation(
			conversationsFetchAbortProbe,
			() => I.click(link('Timer')),
			{ assertLoading: () => I.seeLoading() },
		)
	},
)

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
	await assertExpectedDetailTeardown()
})

export const SearchConversations = meta.story({
	name: 'Search Conversations',
	play: () => I.waitExit(role('status')),
})

SearchConversations.test('typing a query filters by name', async () => {
	await I.search('alex')
	await I.seeConversationInList(/Alex Johnson/i)
	await I.dontSeeConversationInList(/Engineering/i)
	await I.dontSeeConversationInList(/Design Sync/i)
})

SearchConversations.test('search matches last message', async () => {
	await I.search('figma')
	await I.seeConversationInList(/Design Sync/i)
	await I.dontSeeConversationInList(/Engineering/i)
})

SearchConversations.test('search is case-insensitive', async () => {
	await I.search('ENGINEERING')
	await I.seeConversationInList(/Engineering/i)
})

SearchConversations.test('clearing restores the full list', async () => {
	await I.search('alex')
	await I.dontSeeConversationInList(/Engineering/i)
	await I.clearSearch()
	await I.seeConversationInList(/Engineering/i)
	await I.seeConversationInList(/Alex Johnson/i)
})

SearchConversations.test('no results shows nothing matching', async () => {
	await I.search('zzzznomatch')
	await I.dontSeeConversationInList(/Engineering/i)
	await I.dontSeeConversationInList(/Alex Johnson/i)
})
