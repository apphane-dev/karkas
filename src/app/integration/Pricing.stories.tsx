import preview from '#.storybook/preview'
import { App } from '#app/App'
import { PRICING_API_PATH } from '#entities/pricing/api/pricingApi'
import { pricingPlans } from '#entities/pricing/mocks/handlers'
import { pricingActor as I, pricingLoc as loc } from '#pages/pricing/testing'
import { link, role, text } from '#shared/test'
import {
	createRouteFetchAbortProbe,
	expectRouteFetchAbortOnNavigation,
	routeFetchAbortLifecycle,
} from '#shared/test/routeFetchAbortProbe'

const pricingFetchAbortProbe = createRouteFetchAbortProbe(PRICING_API_PATH, 'pricing')

const meta = preview.meta({
	title: 'Integration/Pricing',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'pricing',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({
	name: 'Default',
	play: () => I.waitExit(role('status')),
	parameters: { msw: { handlers: { pricingPlans: pricingPlans.reset } } },
})

Default.test('renders pricing heading', async () => {
	await I.see(loc.heading)
})

Default.test('renders all plan cards', async () => {
	await I.seePricingContent()
})

Default.test('marks Free as the current plan', async () => {
	await I.seeCurrentPlanOn(loc.freeCard)
})

export const UpgradeToPro = meta.story({
	name: 'Upgrade to Pro',
	play: () => I.waitExit(role('status')),
})

UpgradeToPro.test('clicking Upgrade to Pro switches the current plan', async () => {
	await I.seeCurrentPlanOn(loc.freeCard)
	await I.subscribe(loc.proCard, 'Upgrade to Pro')
	await I.seeSubscribeToast('Pro')
	await I.seeCurrentPlanOn(loc.proCard)
	await I.see(role('button', 'Get Free').within(loc.freeCard))
	await I.see(text('Pro plan active'))
})

export const AbortsPendingPricingRequestOnNavigation = meta.story({
	name: 'Aborts Pending Pricing Request On Navigation',
	beforeEach: routeFetchAbortLifecycle(pricingFetchAbortProbe),
	parameters: {
		msw: { handlers: { pricingPlans: pricingPlans.loading } },
	},
})

AbortsPendingPricingRequestOnNavigation.test(
	'aborts the pending pricing request when navigating away',
	async () => {
		await expectRouteFetchAbortOnNavigation(pricingFetchAbortProbe, () => I.click(link('Timer')), {
			assertLoading: () => I.seeLoading(),
		})
	},
)

export const HandlesServerError = meta.story({
	name: 'Server Error',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: { handlers: { pricingPlans: pricingPlans.error } },
	},
})

HandlesServerError.test('shows error state when pricing request fails', async () => {
	await I.seeError()
})

export const RecoversAfterRetry = meta.story({
	name: 'Retry Success',
	play: () => I.waitExit(role('status')),
	parameters: {
		msw: { handlers: { pricingPlans: pricingPlans.retrySucceeds() } },
	},
})

RecoversAfterRetry.test('loads pricing after retry succeeds', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.seePricingContent()
})

export const KeepsLoading = meta.story({
	name: 'Loading State',
	parameters: {
		msw: { handlers: { pricingPlans: pricingPlans.loading } },
	},
})

KeepsLoading.test('shows loading state while pricing is pending', async () => {
	await I.seeLoading()
	await I.dontSee(loc.heading)
})

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	play: () => I.waitExit(role('status')),
	parameters: { msw: { handlers: { pricingPlans: pricingPlans.reset } } },
})

DefaultMobile.test('[mobile] renders all plan cards', async () => {
	await I.seePricingContent()
})

DefaultMobile.test('[mobile] marks Free as the current plan', async () => {
	await I.seeCurrentPlanOn(loc.freeCard)
})
