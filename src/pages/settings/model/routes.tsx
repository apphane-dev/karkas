import { rootRoute } from '#shared/router'

import { SettingsPage } from '../ui/SettingsPage'
import { reatomSettingsPageModel } from './settingsForm'

export const settingsRoute = rootRoute.reatomRoute(
	{
		path: 'settings',
		loader: async () => reatomSettingsPageModel(),
		render: (self) => {
			const model = self.loader.data()
			return model ? <SettingsPage model={model} /> : <></>
		},
	},
	'settings',
)
