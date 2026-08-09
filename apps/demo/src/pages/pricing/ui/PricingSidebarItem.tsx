import { reatomComponent } from '@reatom/react'

import { pricingRoute } from '../model/routes'
import { PricingBanner } from './PricingBanner'

export const PricingSidebarItem = reatomComponent(() => {
	const active = pricingRoute.match()
	const routeModel = active ? pricingRoute.loader.status().data : undefined

	return (
		<a href={pricingRoute.path()} aria-current={active ? 'page' : undefined}>
			<PricingBanner active={active} {...(routeModel ? { plans: routeModel.plans } : {})} />
		</a>
	)
}, 'PricingSidebarItem')
