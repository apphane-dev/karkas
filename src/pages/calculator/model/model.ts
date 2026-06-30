import { action, atom } from '@reatom/core'

type CalculatorOperator = '+' | '-' | '*' | '/'

const ERROR_DISPLAY = 'Error'

export const displayAtom = atom('0', 'calculator.display')

const prevValueAtom = atom<number | null>(null, 'calculator.prevValue')
const operatorAtom = atom<CalculatorOperator | null>(null, 'calculator.operator')
const resetDisplayOnNextInputAtom = atom(false, 'calculator.resetDisplayOnNextInput')

const readDisplayNumber = () => {
	const value = Number.parseFloat(displayAtom())
	return Number.isFinite(value) ? value : null
}

const setError = () => {
	displayAtom.set(ERROR_DISPLAY)
	prevValueAtom.set(null)
	operatorAtom.set(null)
	resetDisplayOnNextInputAtom.set(true)
}

const operatorCalculators = {
	'+': (left: number, right: number) => left + right,
	'-': (left: number, right: number) => left - right,
	'*': (left: number, right: number) => left * right,
	'/': (left: number, right: number) => (right === 0 ? null : left / right),
} satisfies Record<CalculatorOperator, (left: number, right: number) => number | null>

const calculate = (left: number, operator: CalculatorOperator, right: number) =>
	operatorCalculators[operator](left, right)

export const inputDigit = action((digit: string) => {
	if (resetDisplayOnNextInputAtom() || displayAtom() === ERROR_DISPLAY) {
		displayAtom.set(digit)
		resetDisplayOnNextInputAtom.set(false)
		return
	}

	displayAtom.set(displayAtom() === '0' ? digit : displayAtom() + digit)
}, 'calculator.inputDigit')

export const inputDot = action(() => {
	if (resetDisplayOnNextInputAtom() || displayAtom() === ERROR_DISPLAY) {
		displayAtom.set('0.')
		resetDisplayOnNextInputAtom.set(false)
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
const failEvaluation = () => {
	setError()
	return { error: true }
}

const readPendingOperation = () => {
	const prev = prevValueAtom()
	const operator = operatorAtom()
	return prev === null || operator === null ? null : { prev, operator }
}

const commitResult = (result: number | null, current: number) => {
	if (result === null || !Number.isFinite(result)) return failEvaluation()
	displayAtom.set(String(result))
	return { result, current }
}

const evaluatePending = () => {
	const current = readDisplayNumber()
	if (current === null) return failEvaluation()

	const pending = readPendingOperation()
	if (!pending) return { result: null, current }

	return commitResult(calculate(pending.prev, pending.operator, current), current)
}

const carriedValue = (result: number | null, current: number) => result ?? current

export const handleOperator = action((nextOperator: CalculatorOperator) => {
	// When an operator is already pending and the next operand hasn't been
	// entered yet, pressing another operator just replaces it. Falling through
	// after `=` (operator null, reset-display true) seeds prevValue from the
	// displayed result so it can be chained into the next operation.
	if (operatorAtom() !== null && resetDisplayOnNextInputAtom()) {
		operatorAtom.set(nextOperator)
		return
	}

	const outcome = evaluatePending()
	if ('error' in outcome) return

	prevValueAtom.set(carriedValue(outcome.result, outcome.current))
	operatorAtom.set(nextOperator)
	resetDisplayOnNextInputAtom.set(true)
}, 'calculator.handleOperator')

export const handleEquals = action(() => {
	const outcome = evaluatePending()
	if ('error' in outcome || outcome.result === null) return

	prevValueAtom.set(null)
	operatorAtom.set(null)
	resetDisplayOnNextInputAtom.set(true)
}, 'calculator.handleEquals')

export const handleClear = action(() => {
	displayAtom.set('0')
	prevValueAtom.set(null)
	operatorAtom.set(null)
	resetDisplayOnNextInputAtom.set(false)
}, 'calculator.handleClear')

export const handlePercent = action(() => {
	const current = readDisplayNumber()
	if (current !== null) displayAtom.set(String(current / 100))
}, 'calculator.handlePercent')

export const handleToggleSign = action(() => {
	const current = readDisplayNumber()
	if (current !== null) displayAtom.set(String(-current))
}, 'calculator.handleToggleSign')
