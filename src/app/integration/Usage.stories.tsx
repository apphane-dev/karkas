import preview from '#.storybook/preview'
import { App } from '#app/App'
import { usageActor as I, usageLoc as loc } from '#pages/usage/testing'

const meta = preview.meta({
	title: 'Integration/Usage',
	component: App,
	parameters: { layout: 'fullscreen', initialPath: 'usage' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({ name: 'Default' })

Default.test('renders usage heading', async () => {
	await I.see(loc.heading)
})

Default.test('renders storage reset note', async () => {
	await I.see(loc.storageResetNote)
})

Default.test('renders breakdown section', async () => {
	await I.see(loc.breakdownHeading)
	await I.see(loc.documentsRow)
	await I.see(loc.mediaRow)
	await I.see(loc.otherRow)
})

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
})

DefaultMobile.test('[mobile] renders usage heading', async () => {
	await I.see(loc.heading)
})

DefaultMobile.test('[mobile] renders usage content', async () => {
	await I.seeUsageContent()
})
