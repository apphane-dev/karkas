import { retryComputed, wrap } from '@reatom/core'

import { protectedRoute } from '#entities/auth'
import { fetchSettings } from '#entities/setting'
import { m } from '#paraglide/messages.js'
import { withRouteAbort } from '#shared/router'
import { PageError } from '#widgets/data-page'

import { SettingsPage } from '../ui/SettingsPage'
import { SettingsPageLoading } from '../ui/SettingsPageLoading'
import { reatomSettingsPageModel, type SettingsPageModel } from './settingsForm'

const shouldShowLoading = (
	isFirstPending: boolean,
	isPending: boolean,
	model: SettingsPageModel | undefined,
) => isFirstPending || (isPending && !model)

const loadSettingsModel = async () => reatomSettingsPageModel(await withRouteAbort(fetchSettings))

export const settingsRoute = protectedRoute.reatomRoute(
	{
		path: 'settings',
		loader: loadSettingsModel,
		render: (self) => {
			const { isFirstPending, isPending, data: model } = self.loader.status()
			if (shouldShowLoading(isFirstPending, isPending, model)) return <SettingsPageLoading />
			if (!model) {
				return (
					<PageError
						title={m.settings_error_title()}
						description={m.settings_error_description()}
						onRetry={wrap(() => retryComputed(self.loader))}
					/>
				)
			}
			return <SettingsPage model={model} />
		},
	},
	'settings',
)
