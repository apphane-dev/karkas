import { reatomComponent } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import { SideNavButton, SideNavItemContent } from '#widgets/side-nav'

import { timer } from '../model/model'
import { timerRoute } from '../model/routes'
import { TimerRing } from './TimerRing'

const TimerTrailing = reatomComponent(() => {
	const running = timer.running()
	if (!running) return null
	return (
		<span style={{ fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>
			{timer.formatted()}
		</span>
	)
}, 'TimerTrailing')

export const TimerNavItem = reatomComponent(
	() => (
		<a href={timerRoute.path()}>
			<SideNavButton active={timerRoute.match()}>
				<SideNavItemContent
					Icon={() => <TimerRing />}
					label={m.nav_timer()}
					trailing={<TimerTrailing />}
				/>
			</SideNavButton>
		</a>
	),
	'TimerNavItem',
)
