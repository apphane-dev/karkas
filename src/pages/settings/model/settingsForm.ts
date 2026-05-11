import { action, reatomForm } from '@reatom/core'

export type EmailNotification = 'all' | 'important' | 'none'
export type DesktopNotification = 'enabled' | 'disabled'
export type Density = 'compact' | 'comfortable' | 'spacious'

export function createSettingsPageModel() {
	const profileForm = reatomForm(
		{
			displayName: 'Alex Johnson',
			email: 'alex@example.com',
		},
		{ name: 'settings.profileForm' },
	)

	const notificationsForm = reatomForm(
		{
			emailNotif: 'all' as EmailNotification,
			desktopNotif: 'enabled' as DesktopNotification,
		},
		{ name: 'settings.notificationsForm' },
	)

	const appearanceForm = reatomForm(
		{
			density: 'compact' as Density,
		},
		{ name: 'settings.appearanceForm' },
	)

	const saveProfile = action(() => {
		profileForm.init(profileForm())
	}, 'settings.profileForm.save')

	const saveNotifications = action(() => {
		notificationsForm.init(notificationsForm())
	}, 'settings.notificationsForm.save')

	return {
		profileForm,
		saveProfile,
		notificationsForm,
		saveNotifications,
		appearanceForm,
	}
}

export type SettingsPageModel = ReturnType<typeof createSettingsPageModel>
