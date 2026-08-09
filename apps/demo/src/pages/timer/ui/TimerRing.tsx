import { reatomComponent } from '@reatom/react'
import { Timer } from 'lucide-react'

import { css } from '#styled-system/css'

import { timer } from '../model/model'

const iconClass = css({ w: '4', h: '4', flexShrink: '0' })

const RADIUS = 6
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export const TimerRing = reatomComponent(() => {
	if (!timer.running()) {
		return <Timer className={iconClass} />
	}

	const offset = CIRCUMFERENCE * (1 - timer.progress())

	return (
		<svg width="16" height="16" viewBox="0 0 16 16" className={iconClass}>
			<circle
				cx="8"
				cy="8"
				r={RADIUS}
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				style={{ opacity: 0.15 }}
			/>
			<circle
				cx="8"
				cy="8"
				r={RADIUS}
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeDasharray={CIRCUMFERENCE}
				strokeDashoffset={offset}
				strokeLinecap="round"
				transform="rotate(-90 8 8)"
			/>
		</svg>
	)
}, 'TimerRing')
