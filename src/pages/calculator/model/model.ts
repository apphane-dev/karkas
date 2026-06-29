import { action, atom } from '@reatom/core'

export type CalculatorOperator = '+' | '-' | '*' | '/'

const ERROR_DISPLAY = 'Error'

export const displayAtom = atom('0', 'calculator.display')

const prevValueAtom = atom<number | null>(null, 'calculator.prevValue')
const operatorAtom = atom<CalculatorOperator | null>(null, 'calculator.operator')
const resetNextAtom = atom(false, 'calculator.resetNext')

const readDisplayNumber = () => {
	const value = Number.parseFloat(displayAtom())
	return Number.isFinite(value) ? value : null
}

const setError = () => {
	displayAtom.set(ERROR_DISPLAY)
	prevValueAtom.set(null)
	operatorAtom.set(null)
	resetNextAtom.set(true)
}

const calculate = (left: number, operator: CalculatorOperator, right: number) => {
	switch (operator) {
		case '+':
			return left + right
		case '-':
			return left - right
		case '*':
			return left * right
		case '/':
			return right === 0 ? null : left / right
	}
}

export const inputDigit = action((digit: string) => {
	if (resetNextAtom() || displayAtom() === ERROR_DISPLAY) {
		displayAtom.set(digit)
		resetNextAtom.set(false)
		return
	}

	displayAtom.set(displayAtom() === '0' ? digit : displayAtom() + digit)
}, 'calculator.inputDigit')

export const inputDot = action(() => {
	if (resetNextAtom() || displayAtom() === ERROR_DISPLAY) {
		displayAtom.set('0.')
		resetNextAtom.set(false)
		return
	}

	if (!displayAtom().includes('.')) {
		displayAtom.set(displayAtom() + '.')
	}
}, 'calculator.inputDot')

export const handleOperator = action((nextOperator: CalculatorOperator) => {
	const current = readDisplayNumber()
	const prev = prevValueAtom()
	const operator = operatorAtom()

	if (current === null) {
		setError()
		return
	}

	if (prev !== null && operator) {
		const result = calculate(prev, operator, current)
		if (result === null) {
			setError()
			return
		}

		displayAtom.set(String(result))
		prevValueAtom.set(result)
	} else {
		prevValueAtom.set(current)
	}

	operatorAtom.set(nextOperator)
	resetNextAtom.set(true)
}, 'calculator.handleOperator')

export const handleEquals = action(() => {
	const current = readDisplayNumber()
	const prev = prevValueAtom()
	const operator = operatorAtom()

	if (current === null) {
		setError()
		return
	}

	if (prev !== null && operator) {
		const result = calculate(prev, operator, current)
		if (result === null) {
			setError()
			return
		}

		displayAtom.set(String(result))
		prevValueAtom.set(null)
		operatorAtom.set(null)
		resetNextAtom.set(true)
	}
}, 'calculator.handleEquals')

export const handleClear = action(() => {
	displayAtom.set('0')
	prevValueAtom.set(null)
	operatorAtom.set(null)
	resetNextAtom.set(false)
}, 'calculator.handleClear')

export const handlePercent = action(() => {
	const current = readDisplayNumber()
	if (current !== null) displayAtom.set(String(current / 100))
}, 'calculator.handlePercent')

export const handleToggleSign = action(() => {
	const current = readDisplayNumber()
	if (current !== null) displayAtom.set(String(-current))
}, 'calculator.handleToggleSign')
