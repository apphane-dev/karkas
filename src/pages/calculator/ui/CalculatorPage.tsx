import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import { Button, VisuallyHidden } from '#shared/components'
import { css } from '#styled-system/css'
import { styled } from '#styled-system/jsx'

import {
	displayAtom,
	handleClear,
	handleEquals,
	handleOperator,
	handlePercent,
	handleToggleSign,
	inputDigit,
	inputDot,
	type CalculatorOperator,
} from '../model/model'

type CalculatorButton =
	| { kind: 'function'; label: string; action: 'clear' | 'toggleSign' | 'percent' }
	| { kind: 'operator'; label: string; operator: CalculatorOperator }
	| { kind: 'digit'; label: string; digit: string; gridColumn?: string }
	| { kind: 'digit'; label: string; action: 'dot' }
	| { kind: 'operator'; label: string; action: 'equals' }

const BUTTONS = [
	{ label: 'AC', kind: 'function', action: 'clear' },
	{ label: '+/−', kind: 'function', action: 'toggleSign' },
	{ label: '%', kind: 'function', action: 'percent' },
	{ label: '÷', kind: 'operator', operator: '/' },
	{ label: '7', kind: 'digit', digit: '7' },
	{ label: '8', kind: 'digit', digit: '8' },
	{ label: '9', kind: 'digit', digit: '9' },
	{ label: '×', kind: 'operator', operator: '*' },
	{ label: '4', kind: 'digit', digit: '4' },
	{ label: '5', kind: 'digit', digit: '5' },
	{ label: '6', kind: 'digit', digit: '6' },
	{ label: '−', kind: 'operator', operator: '-' },
	{ label: '1', kind: 'digit', digit: '1' },
	{ label: '2', kind: 'digit', digit: '2' },
	{ label: '3', kind: 'digit', digit: '3' },
	{ label: '+', kind: 'operator', operator: '+' },
	{ label: '0', kind: 'digit', digit: '0', gridColumn: 'span 2' },
	{ label: '.', kind: 'digit', action: 'dot' },
	{ label: '=', kind: 'operator', action: 'equals' },
] as const satisfies ReadonlyArray<CalculatorButton>

const buttonStyle = css({
	h: '14',
	fontSize: 'lg',
	fontWeight: 'medium',
	borderRadius: 'lg',
	cursor: 'pointer',
	border: 'none',
	transition: 'background 0.1s',
})

const buttonVariantClass = {
	digit: css({
		bg: 'gray.3',
		color: 'gray.12',
		_hover: { bg: 'gray.4' },
		_active: { bg: 'gray.5' },
	}),
	operator: css({
		bg: 'colorPalette.9',
		color: 'white',
		_hover: { bg: 'colorPalette.10' },
		_active: { bg: 'colorPalette.11' },
	}),
	function: css({
		bg: 'gray.5',
		color: 'gray.12',
		_hover: { bg: 'gray.6' },
		_active: { bg: 'gray.7' },
	}),
} satisfies Record<CalculatorButton['kind'], string>

const pressButton = (button: CalculatorButton) => {
	if ('digit' in button) return inputDigit(button.digit)
	if ('operator' in button) return handleOperator(button.operator)

	switch (button.action) {
		case 'clear':
			return handleClear()
		case 'toggleSign':
			return handleToggleSign()
		case 'percent':
			return handlePercent()
		case 'dot':
			return inputDot()
		case 'equals':
			return handleEquals()
	}
}

export const CalculatorPage = reatomComponent(() => {
	return (
		<styled.div
			p="8"
			display="flex"
			justifyContent="center"
			alignItems="center"
			minH="calc(100dvh - var(--app-header-h, 0px))"
		>
			<styled.div w="320px">
				<VisuallyHidden as="h1">{m.calculator_title()}</VisuallyHidden>

				<styled.div bg="gray.2" borderRadius="xl" p="4" borderWidth="1px" borderColor="border">
					<styled.output
						aria-label="Calculator display"
						textAlign="right"
						fontSize="3xl"
						fontWeight="bold"
						fontVariantNumeric="tabular-nums"
						p="3"
						mb="3"
						bg="gray.1"
						borderRadius="lg"
						minH="14"
						display="flex"
						alignItems="center"
						justifyContent="flex-end"
						overflow="hidden"
					>
						<styled.span truncate>{displayAtom()}</styled.span>
					</styled.output>

					<styled.div display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="2">
						{BUTTONS.map((button) => (
							<Button
								key={button.label}
								className={`${buttonStyle} ${buttonVariantClass[button.kind]}`}
								gridColumn={'gridColumn' in button ? button.gridColumn : undefined}
								onClick={wrap(() => pressButton(button))}
							>
								{button.label}
							</Button>
						))}
					</styled.div>
				</styled.div>
			</styled.div>
		</styled.div>
	)
}, 'CalculatorPage')
