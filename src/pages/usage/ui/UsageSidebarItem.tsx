import { reatomComponent } from '@reatom/react'

import { usageRoute } from '../model/routes'
import { UsageCard } from './UsageCard'

export const UsageSidebarItem = reatomComponent(() => {
	const isActive = usageRoute.match()
	const routeData = isActive ? usageRoute.loader.data() : undefined

	return (
		<a href={usageRoute.path()} aria-current={isActive ? 'page' : undefined}>
			<UsageCard active={isActive} data={routeData} loadGlobal={!isActive} />
		</a>
	)
}, 'UsageSidebarItem')
