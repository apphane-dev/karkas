import { retryComputed, wrap } from '@reatom/core'

import { fetchSettings } from '#entities/setting'
import { m } from '#paraglide/messages.js'
import { orgGuardRoute } from '#shared/router'
import { PageError } from '#widgets/data-page'

import { SettingsPage } from '../ui/SettingsPage'
import { SettingsPageLoading } from '../ui/SettingsPageLoading'
import { reatomSettingsPageModel, type SettingsPageModel } from './settingsForm'

const shouldShowLoading = (
	isFirstPending: boolean,
	isPending: boolean,
	model: SettingsPageModel | undefined,
) => isFirstPending || (isPending && !model)

// Org-scoped on purpose: settings describe the organization, so the page
// hangs off the org guard and an organization switch from this deep URL
// collapses back to the app root instead of painting the previous org's
// settings.
export const settingsRoute = orgGuardRoute.reatomRoute(
	{
		path: 'settings',
		loader: async () => reatomSettingsPageModel(await wrap(fetchSettings())),
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
