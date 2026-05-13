import preview from '#.storybook/preview'
import { button, createActor, text } from '#shared/test'

import { CalculatorPage } from './CalculatorPage'

const btn = (name: string | RegExp) => button(name)
const display = (value: string) => text(value).options({ selector: 'span' })

const I = createActor().extend((targetI) => ({
	tap: async (label: string | RegExp) => {
		await targetI.click(btn(label))
	},
	seeDisplay: async (value: string) => {
		await targetI.see(display(value))
	},
}))

const meta = preview.meta({
	title: 'Pages/Calculator',
	component: CalculatorPage,
	parameters: { layout: 'centered' },
	loaders: [(ctx) => void I.init(ctx)],
})

export default meta

export const Default = meta.story({ name: 'Default' })

Default.test('performs basic addition: 7 + 5 = 12', async () => {
	await I.tap('7')
	await I.seeDisplay('7')
	await I.tap('+')
	await I.tap('5')
	await I.seeDisplay('5')
	await I.tap('=')
	await I.seeDisplay('12')
})

Default.test('performs basic subtraction: 9 − 4 = 5', async () => {
	await I.tap('9')
	await I.tap('−')
	await I.tap('4')
	await I.tap('=')
	await I.seeDisplay('5')
})

Default.test('performs basic multiplication: 6 × 3 = 18', async () => {
	await I.tap('6')
	await I.tap('×')
	await I.tap('3')
	await I.tap('=')
	await I.seeDisplay('18')
})

Default.test('performs basic division: 8 ÷ 2 = 4', async () => {
	await I.tap('8')
	await I.tap('÷')
	await I.tap('2')
	await I.tap('=')
	await I.seeDisplay('4')
})

Default.test('handles decimal point', async () => {
	await I.tap('1')
	await I.tap('.')
	await I.tap('5')
	await I.seeDisplay('1.5')
	await I.tap('.') // Should do nothing
	await I.seeDisplay('1.5')
	await I.tap('×')
	await I.tap('2')
	await I.tap('=')
	await I.seeDisplay('3')
})

Default.test('handles decimal point after operator', async () => {
	await I.tap('5')
	await I.tap('+')
	await I.tap('.')
	await I.seeDisplay('0.')
	await I.tap('2')
	await I.tap('=')
	await I.seeDisplay('5.2')
})

Default.test('toggles sign: 5 to -5', async () => {
	await I.tap('5')
	await I.tap('+/−')
	await I.seeDisplay('-5')
	await I.tap('+/−')
	await I.seeDisplay('5')
})

Default.test('calculates percentage: 50% = 0.5', async () => {
	await I.tap('5')
	await I.tap('0')
	await I.tap('%')
	await I.seeDisplay('0.5')
})

Default.test('clears display with AC', async () => {
	await I.tap('1')
	await I.tap('2')
	await I.tap('3')
	await I.seeDisplay('123')
	await I.tap('AC')
	await I.seeDisplay('0')
})

Default.test('handles consecutive operations', async () => {
	await I.tap('5')
	await I.tap('+')
	await I.tap('5')
	await I.tap('+') // Should calculate intermediate result 10
	await I.seeDisplay('10')
	await I.tap('2')
	await I.tap('=')
	await I.seeDisplay('12')
})

Default.test('division by zero shows Error', async () => {
	await I.tap('5')
	await I.tap('÷')
	await I.tap('0')
	await I.tap('=')
	await I.seeDisplay('Error')
})

Default.test('error persists when operator is pressed after division by zero', async () => {
	await I.tap('5')
	await I.tap('÷')
	await I.tap('0')
	await I.tap('+')
	await I.seeDisplay('Error')
})
