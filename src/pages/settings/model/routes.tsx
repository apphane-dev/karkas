import { protectedRoute } from '#entities/auth'

import { SettingsPage } from '../ui/SettingsPage'
import { reatomSettingsPageModel } from './settingsForm'

export const settingsRoute = protectedRoute.reatomRoute(
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
