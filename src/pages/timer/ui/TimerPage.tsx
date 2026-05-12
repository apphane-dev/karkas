import { wrap } from '@reatom/core'
import { reatomComponent, useAtom } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import { Button, Input, VisuallyHidden } from '#shared/components'
import { styled } from '#styled-system/jsx'

import {
	formatTime,
	pauseTimer,
	resetTimer,
	setDuration,
	startTimer,
	timerRemainingAtom,
	timerRunningAtom,
} from '../model/atoms'

const PRESETS = [
	{ label: '10s', seconds: 10 },
	{ label: '1m', seconds: 60 },
	{ label: '5m', seconds: 300 },
	{ label: '10m', seconds: 600 },
	{ label: '25m', seconds: 1500 },
] as const

function parseCustomDuration(input: string): number | null {
	const [rawMinutes = '0', rawSeconds = '0'] = input.split(':')
	const minutes = Number.parseInt(rawMinutes, 10)
	const seconds = Number.parseInt(rawSeconds, 10)
	const duration = minutes * 60 + seconds

	if (Number.isNaN(minutes) || Number.isNaN(seconds) || duration <= 0) {
		return null
	}
	return duration
}

export const TimerPage = reatomComponent(() => {
	const [customInput, setCustomInput] = useAtom('')

	const handleCustomTimeCommit = wrap(() => {
		const duration = parseCustomDuration(customInput)
		if (duration !== null) setDuration(duration)
		setCustomInput('')
	})

	return (
		<styled.div
			p="8"
			display="flex"
			justifyContent="center"
			alignItems="center"
			minH="calc(100dvh - var(--app-header-h, 0px))"
		>
			<styled.div w="320px" display="flex" flexDirection="column" alignItems="center" gap="6">
				<VisuallyHidden as="h1">{m.nav_timer()}</VisuallyHidden>

				<styled.div
					fontSize="6xl"
					fontWeight="bold"
					fontVariantNumeric="tabular-nums"
					lineHeight="1"
				>
					{formatTime(timerRemainingAtom())}
				</styled.div>

				<styled.div display="flex" gap="2">
					{PRESETS.map(({ label, seconds }) => (
						<Button
							key={label}
							variant="outline"
							size="sm"
							disabled={timerRunningAtom()}
							onClick={wrap(() => setDuration(seconds))}
						>
							{label}
						</Button>
					))}
				</styled.div>

				<Input
					placeholder="MM:SS"
					size="sm"
					w="20"
					value={customInput}
					disabled={timerRunningAtom()}
					onChange={(e) => setCustomInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') handleCustomTimeCommit()
					}}
					onBlur={handleCustomTimeCommit}
				/>

				<styled.div display="flex" gap="2">
					{timerRunningAtom() ? (
						<Button variant="outline" onClick={wrap(() => pauseTimer())}>
							{m.timer_pause()}
						</Button>
					) : (
						<Button onClick={wrap(() => startTimer())} disabled={timerRemainingAtom() <= 0}>
							{m.timer_start()}
						</Button>
					)}
					<Button variant="outline" onClick={wrap(() => resetTimer())}>
						{m.timer_reset()}
					</Button>
				</styled.div>
			</styled.div>
		</styled.div>
	)
}, 'TimerPage')
