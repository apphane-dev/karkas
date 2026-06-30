import { retryComputed, wrap } from '@reatom/core'

import { fetchPricing } from '#entities/pricing'
import { m } from '#paraglide/messages.js'
import { rootRoute } from '#shared/router'
import { PageError } from '#widgets/data-page'

import { PricingPage } from '../ui/PricingPage'
import { PricingPageLoading } from '../ui/PricingPageLoading'
import { reatomPricingPageModel } from './pricingModel'

export const pricingRoute = rootRoute.reatomRoute(
	{
		path: 'pricing',
		loader: async () => reatomPricingPageModel(await fetchPricing()),
		render: (self) => {
			const { isFirstPending, isPending, data: model } = self.loader.status()
			if (isFirstPending || (isPending && !model)) {
				return <PricingPageLoading />
			}
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
