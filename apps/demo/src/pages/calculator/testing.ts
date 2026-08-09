import { button, createActor, heading, text } from '#shared/test'

export const calculatorLoc = {
	heading: heading('Calculator'),
	acButton: button('AC'),
	equalsButton: button('='),
	zeroButton: button('0'),
	display: (value: string) => text(value).options({ selector: 'span' }),
	key: (label: string | RegExp) => button(label),
}

export const calculatorActor = createActor().extend((I) => ({
	press: async (label: string | RegExp) => {
		await I.click(calculatorLoc.key(label))
	},
	pressMany: async (...labels: Array<string | RegExp>) => {
		for (const label of labels) {
			await I.click(calculatorLoc.key(label))
		}
	},
	seeDisplay: async (value: string) => {
		await I.see(calculatorLoc.display(value))
	},
	seeCalculatorContent: async () => {
		await I.see(calculatorLoc.heading)
		await I.see(calculatorLoc.acButton)
		await I.see(calculatorLoc.equalsButton)
		await I.see(calculatorLoc.zeroButton)
	},
}))
