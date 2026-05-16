import preview from '#.storybook/preview'
import { App } from '#app/App'
import { pricingActor as I, pricingLoc as loc } from '#pages/pricing/testing'

const meta = preview.meta({
	title: 'Integration/Pricing',
	component: App,
	parameters: { layout: 'fullscreen', initialPath: 'pricing' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({ name: 'Default' })

Default.test('renders pricing heading', async () => {
	await I.see(loc.heading)
})

Default.test('renders all plan cards', async () => {
	await I.seePricingContent()
})

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
})

DefaultMobile.test('[mobile] renders pricing heading', async () => {
	await I.see(loc.heading)
})

DefaultMobile.test('[mobile] renders all plan cards', async () => {
	await I.seePricingContent()
})
