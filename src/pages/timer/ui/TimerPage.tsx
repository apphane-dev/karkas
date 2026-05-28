import { wrap } from '@reatom/core'
import { reatomComponent, useAtom } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import { Button, Input, VisuallyHidden } from '#shared/components'
import { styled } from '#styled-system/jsx'

import { timer } from '../model/model'

const PRESETS = [
	{ label: '10s', seconds: 10 },
	{ label: '1m', seconds: 60 },
	{ label: '5m', seconds: 300 },
	{ label: '10m', seconds: 600 },
	{ label: '25m', seconds: 1500 },
] as const

export const TimerPage = reatomComponent(() => {
	const [customInput, setCustomInput] = useAtom('')
	const isRunning = timer.running()
	const isStartDisabled = timer.remaining() <= 0

	const handleCustomTimeCommit = wrap(() => {
		timer.commitCustomDuration(customInput)
		setCustomInput('')
	})
	const handleStart = wrap(() => timer.running.setTrue())
	const handlePause = wrap(() => timer.running.setFalse())
	const handleReset = wrap(() => timer.reset())

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
					{timer.formatted()}
				</styled.div>

				<styled.div display="flex" gap="2">
					{PRESETS.map(({ label, seconds }) => (
						<Button
							key={label}
							variant="outline"
							size="sm"
							disabled={isRunning}
							onClick={wrap(() => timer.setDuration(seconds))}
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
					disabled={isRunning}
					onChange={(e) => setCustomInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') handleCustomTimeCommit()
					}}
					onBlur={handleCustomTimeCommit}
				/>

				<styled.div display="flex" gap="2">
					{isRunning ? (
						<Button variant="outline" onClick={handlePause}>
							{m.timer_pause()}
						</Button>
					) : (
						<Button onClick={handleStart} disabled={isStartDisabled}>
							{m.timer_start()}
						</Button>
					)}
					<Button variant="outline" onClick={handleReset}>
						{m.timer_reset()}
					</Button>
				</styled.div>
			</styled.div>
		</styled.div>
	)
}, 'TimerPage')
