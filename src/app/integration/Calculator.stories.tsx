import preview from '#.storybook/preview'
import { App } from '#app/App'
import { calculatorActor as I, calculatorLoc as loc } from '#pages/calculator/testing'

const meta = preview.meta({
	title: 'Integration/Calculator',
	component: App,
	parameters: { layout: 'fullscreen', initialPath: 'calculator' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({ name: 'Default' })

Default.test('renders calculator heading', async () => {
	await I.see(loc.heading)
})

Default.test('renders calculator buttons', async () => {
	await I.seeCalculatorContent()
})

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
})

DefaultMobile.test('[mobile] renders calculator heading', async () => {
	await I.see(loc.heading)
})

DefaultMobile.test('[mobile] renders calculator buttons', async () => {
	await I.seeCalculatorContent()
})
