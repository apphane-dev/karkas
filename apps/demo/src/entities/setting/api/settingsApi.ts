import type {
	NotificationSettings,
	ProfileSettings,
	SettingsData,
} from '#entities/setting/model/types'

import { apiClient } from '#shared/api'

export const SETTINGS_API_PATH = '/settings'
export const SETTINGS_PROFILE_API_PATH = '/settings/profile'
export const SETTINGS_NOTIFICATIONS_API_PATH = '/settings/notifications'

export async function fetchSettings() {
	return apiClient.get<SettingsData>(SETTINGS_API_PATH)
}

export async function updateProfile(
	values: ProfileSettings,
	options?: Pick<RequestInit, 'signal'>,
) {
	return apiClient.post<{ ok: true }>(SETTINGS_PROFILE_API_PATH, { ...options, body: values })
}

export async function updateNotifications(
	values: NotificationSettings,
	options?: Pick<RequestInit, 'signal'>,
) {
	return apiClient.post<{ ok: true }>(SETTINGS_NOTIFICATIONS_API_PATH, {
		...options,
		body: values,
	})
}
