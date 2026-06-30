import type { NotificationSettings, ProfileSettings, SettingsData } from '#entities/setting'

import { action, atom, framePromise, reatomForm, sleep, withAbort, wrap } from '@reatom/core'

import { updateNotifications, updateProfile } from '#entities/setting'
import { m } from '#paraglide/messages.js'
import { toaster } from '#shared/components'

// Re-exported so `SettingsPage.tsx`'s existing imports keep working.
export type { DesktopNotification, EmailNotification } from '#entities/setting'
export type Density = 'compact' | 'comfortable' | 'spacious'

const SAVE_DELAY_MS = 300

// `framePromise()` must run before any `await` to bind to the action frame, so
// each helper performs the API request itself (mirrors pricingModel.ts).
async function saveProfileWithToast(values: ProfileSettings) {
	const id = toaster.create({ title: m.settings_saving(), type: 'loading', closable: false })
	let completed = false
	void framePromise()
		.finally(() => {
			if (!completed) toaster.remove(id)
		})
		.catch(() => {})
	try {
		await wrap(updateProfile(values))
		await wrap(sleep(SAVE_DELAY_MS))
		toaster.update(id, { title: m.settings_profile_saved(), type: 'success' })
		completed = true
	} catch (error) {
		toaster.remove(id)
		throw error
	}
}

async function saveNotificationsWithToast(values: NotificationSettings) {
	const id = toaster.create({ title: m.settings_saving(), type: 'loading', closable: false })
	let completed = false
	void framePromise()
		.finally(() => {
			if (!completed) toaster.remove(id)
		})
		.catch(() => {})
	try {
		await wrap(updateNotifications(values))
		await wrap(sleep(SAVE_DELAY_MS))
		toaster.update(id, { title: m.settings_notifications_saved(), type: 'success' })
		completed = true
	} catch (error) {
		toaster.remove(id)
		throw error
	}
}

export function reatomSettingsPageModel(data: SettingsData) {
	const profileForm = reatomForm(data.profile, { name: 'settings.profileForm' })
	const notificationsForm = reatomForm(data.notifications, {
		name: 'settings.notificationsForm',
	})
	const appearanceForm = reatomForm(
		{ density: 'compact' as Density },
		{
			name: 'settings.appearanceForm',
		},
	)

	const isSavingProfile = atom(false, 'settings.isSavingProfile')
	const isSavingNotifications = atom(false, 'settings.isSavingNotifications')

	const saveProfile = action(async () => {
		if (!profileForm.focus().dirty || isSavingProfile()) return
		isSavingProfile.set(true)
		try {
			await wrap(saveProfileWithToast(profileForm()))
			profileForm.init(profileForm())
		} catch {
			toaster.create({ title: m.settings_save_error(), type: 'error' })
		} finally {
			isSavingProfile.set(false)
		}
	}, 'settings.profileForm.save').extend(withAbort())

	const saveNotifications = action(async () => {
		if (!notificationsForm.focus().dirty || isSavingNotifications()) return
		isSavingNotifications.set(true)
		try {
			await wrap(saveNotificationsWithToast(notificationsForm()))
			notificationsForm.init(notificationsForm())
		} catch {
			toaster.create({ title: m.settings_save_error(), type: 'error' })
		} finally {
			isSavingNotifications.set(false)
		}
	}, 'settings.notificationsForm.save').extend(withAbort())

	return {
		profileForm,
		saveProfile,
		isSavingProfile,
		notificationsForm,
		saveNotifications,
		isSavingNotifications,
		appearanceForm,
	}
}

export type SettingsPageModel = ReturnType<typeof reatomSettingsPageModel>
