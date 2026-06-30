import { retryComputed, wrap } from '@reatom/core'

import { protectedRoute } from '#entities/auth'
import { fetchSettings } from '#entities/setting'
import { m } from '#paraglide/messages.js'
import { PageError } from '#widgets/data-page'

import { SettingsPage } from '../ui/SettingsPage'
import { SettingsPageLoading } from '../ui/SettingsPageLoading'
import { reatomSettingsPageModel } from './settingsForm'

export const settingsRoute = protectedRoute.reatomRoute(
	{
		path: 'settings',
		loader: async () => reatomSettingsPageModel(await fetchSettings()),
		render: (self) => {
			const { isFirstPending, isPending, data: model } = self.loader.status()
			if (isFirstPending || (isPending && !model)) return <SettingsPageLoading />
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
