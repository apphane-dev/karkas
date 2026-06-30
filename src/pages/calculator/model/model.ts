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

// Reads the current operand and, when a binary operation is pending,
// evaluates it and writes the result to the display. Shared by
// `handleOperator` (which chains into the next operator) and `handleEquals`
// (which finalizes the calculation). Returns `{ error: true }` when the
// display was non-numeric or the operation overflowed/divided by zero and
// `setError` has already been called, `{ result, current }` when a pending
// operation was applied (`result` is already shown on the display), or
// `{ result: null, current }` when there is no pending operation to apply.
const evaluatePending = () => {
	const current = readDisplayNumber()
	if (current === null) {
		setError()
		return { error: true }
	}

	const prev = prevValueAtom()
	const operator = operatorAtom()
	if (prev === null || operator === null) return { result: null, current }

	const result = calculate(prev, operator, current)
	if (result === null) {
		setError()
		return { error: true }
	}

	displayAtom.set(String(result))
	return { result, current }
}

export const handleOperator = action((nextOperator: CalculatorOperator) => {
	const outcome = evaluatePending()
	if ('error' in outcome) return

	prevValueAtom.set(outcome.result ?? outcome.current)
	operatorAtom.set(nextOperator)
	resetNextAtom.set(true)
}, 'calculator.handleOperator')

export const handleEquals = action(() => {
	const outcome = evaluatePending()
	if ('error' in outcome || outcome.result === null) return

	prevValueAtom.set(null)
	operatorAtom.set(null)
	resetNextAtom.set(true)
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
