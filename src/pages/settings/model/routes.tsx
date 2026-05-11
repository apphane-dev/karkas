import { rootRoute } from '#shared/router'

import { SettingsPage } from '../ui/SettingsPage'
import { createSettingsPageModel } from './settingsForm'

export const settingsRoute = rootRoute.reatomRoute(
	{
		path: 'settings',
		loader: async () => createSettingsPageModel(),
		render: (self) => {
			const model = self.loader.data()
			return model ? <SettingsPage model={model} /> : <></>
		},
	},
	'settings',
)
