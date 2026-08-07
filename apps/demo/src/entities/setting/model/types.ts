export type EmailNotification = 'all' | 'important' | 'none'
export type DesktopNotification = 'enabled' | 'disabled'

export type ProfileSettings = {
	displayName: string
	email: string
}

export type NotificationSettings = {
	emailNotif: EmailNotification
	desktopNotif: DesktopNotification
}

export type SettingsData = {
	profile: ProfileSettings
	notifications: NotificationSettings
}
