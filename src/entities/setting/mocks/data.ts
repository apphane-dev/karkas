import type { SettingsData } from '#entities/setting/model/types'

export const settingsMockData = {
	profile: { displayName: 'Alex Johnson', email: 'alex@example.com' },
	notifications: { emailNotif: 'all', desktopNotif: 'enabled' },
} satisfies SettingsData
