import preview from '#.storybook/preview'
import { App } from '#app/App'
import { m } from '#paraglide/messages.js'
import { createActor, heading, role, text, link } from '#shared/test'

const storageSummary = m.usage_storage_desc({ usedGB: 4.2, totalGB: 10 })
const storageProgressNote = text(storageSummary).wait()
const upgradeToProBanner = text('10 GB storage & priority support')

const I = createActor()

const meta = preview.meta({
	title: 'Integration/Sidebar Footer',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'dashboard',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({
	name: 'Default',
	play: () => I.waitExit(role('status')),
})

Default.test('shows usage storage card in sidebar footer', async () => {
	await I.see(storageProgressNote)
})

Default.test('shows upgrade to pro banner in sidebar footer', async () => {
	await I.see(upgradeToProBanner)
})

export const ActiveUsageRoute = meta.story({
	name: 'Active Usage Route',
	parameters: { initialPath: 'usage' },
	play: () => I.waitExit(role('status')),
})

ActiveUsageRoute.test(
	'shows storage card in sidebar and usage page content simultaneously',
	async () => {
		await I.seeNumberOfElements(text(storageSummary).all(), 2)
		await I.see(heading('Usage'))
	},
)

ActiveUsageRoute.test('marks usage card as current page in sidebar', async () => {
	await I.see(link(/Storage/).options({ current: 'page' }))
	await I.dontSee(link(/Upgrade to Pro/).options({ current: 'page' }))
})

export const ActivePricingRoute = meta.story({
	name: 'Active Pricing Route',
	parameters: { initialPath: 'pricing' },
	play: () => I.waitExit(role('status')),
})

ActivePricingRoute.test(
	'shows upgrade banner in sidebar and pricing page content simultaneously',
	async () => {
		await I.see(upgradeToProBanner)
		await I.see(heading('Pricing'))
	},
)

ActivePricingRoute.test('marks pricing banner as current page in sidebar', async () => {
	await I.see(link(/Upgrade to Pro/).options({ current: 'page' }))
	await I.dontSee(link(/Storage/).options({ current: 'page' }))
})
