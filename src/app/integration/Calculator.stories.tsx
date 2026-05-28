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

Default.test('performs basic addition: 7 + 5 = 12', async () => {
	await I.press('7')
	await I.seeDisplay('7')
	await I.pressMany('+', '5', '=')
	await I.seeDisplay('12')
})

Default.test('performs basic subtraction: 9 − 4 = 5', async () => {
	await I.pressMany('9', '−', '4', '=')
	await I.seeDisplay('5')
})

Default.test('performs basic multiplication: 6 × 3 = 18', async () => {
	await I.pressMany('6', '×', '3', '=')
	await I.seeDisplay('18')
})

Default.test('performs basic division: 8 ÷ 2 = 4', async () => {
	await I.pressMany('8', '÷', '2', '=')
	await I.seeDisplay('4')
})

Default.test('handles decimal point', async () => {
	await I.pressMany('1', '.', '5')
	await I.seeDisplay('1.5')
	await I.press('.') // Should do nothing
	await I.seeDisplay('1.5')
	await I.pressMany('×', '2', '=')
	await I.seeDisplay('3')
})

Default.test('handles decimal point after operator', async () => {
	await I.pressMany('5', '+', '.')
	await I.seeDisplay('0.')
	await I.pressMany('2', '=')
	await I.seeDisplay('5.2')
})

Default.test('toggles sign: 5 to -5', async () => {
	await I.pressMany('5', '+/−')
	await I.seeDisplay('-5')
	await I.press('+/−')
	await I.seeDisplay('5')
})

Default.test('calculates percentage: 50% = 0.5', async () => {
	await I.pressMany('5', '0', '%')
	await I.seeDisplay('0.5')
})

Default.test('clears display with AC', async () => {
	await I.pressMany('1', '2', '3')
	await I.seeDisplay('123')
	await I.press('AC')
	await I.seeDisplay('0')
})

Default.test('handles consecutive operations', async () => {
	await I.pressMany('5', '+', '5', '+')
	await I.seeDisplay('10')
	await I.pressMany('2', '=')
	await I.seeDisplay('12')
})

Default.test('division by zero shows Error', async () => {
	await I.pressMany('5', '÷', '0', '=')
	await I.seeDisplay('Error')
})

Default.test('error persists when operator is pressed after division by zero', async () => {
	await I.pressMany('5', '÷', '0', '+')
	await I.seeDisplay('Error')
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
