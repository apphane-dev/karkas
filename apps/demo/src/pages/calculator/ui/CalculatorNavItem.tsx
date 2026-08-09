import { reatomComponent } from '@reatom/react'
import { Calculator } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { SideNavButton, SideNavItemContent } from '#widgets/side-nav'

import { calculatorRoute } from '../model/routes'

export const CalculatorNavItem = reatomComponent(
	() => (
		<a href={calculatorRoute.path()}>
			<SideNavButton active={calculatorRoute.match()}>
				<SideNavItemContent Icon={Calculator} label={m.nav_calculator()} />
			</SideNavButton>
		</a>
	),
	'CalculatorNavItem',
)
