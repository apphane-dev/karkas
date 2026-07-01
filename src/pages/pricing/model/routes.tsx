import { abortVar, retryComputed, wrap } from '@reatom/core'

import { currentPlanIdAtom, fetchPricing } from '#entities/pricing'
import { m } from '#paraglide/messages.js'
import { rootRoute } from '#shared/router'
import { PageError } from '#widgets/data-page'

import { PricingPage } from '../ui/PricingPage'
import { PricingPageLoading } from '../ui/PricingPageLoading'
import { reatomPricingPageModel, type PricingPageModel } from './pricingModel'

const shouldShowLoading = (
	isFirstPending: boolean,
	isPending: boolean,
	model: PricingPageModel | undefined,
) => isFirstPending || (isPending && !model)

const loadPricingModel = async () => {
	const data = await wrap(fetchPricing({ signal: abortVar.require().signal }))
	currentPlanIdAtom.set(data.currentPlanId)
	return reatomPricingPageModel(data)
}

export const pricingRoute = rootRoute.reatomRoute(
	{
		path: 'pricing',
		loader: loadPricingModel,
		render: (self) => {
			const { isFirstPending, isPending, data: model } = self.loader.status()
			if (shouldShowLoading(isFirstPending, isPending, model)) return <PricingPageLoading />
			if (!model) {
				return (
					<PageError
						title={m.pricing_error_title()}
						description={m.pricing_error_description()}
						onRetry={wrap(() => retryComputed(self.loader))}
					/>
				)
			}
			return <PricingPage model={model} />
		},
	},
	'pricing',
)
