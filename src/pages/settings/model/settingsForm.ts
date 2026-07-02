import type { NotificationSettings, ProfileSettings, SettingsData } from '#entities/setting'

import {
	abortVar,
	action,
	framePromise,
	reatomForm,
	sleep,
	withAbort,
	withAsync,
	wrap,
} from '@reatom/core'

import { updateNotifications, updateProfile } from '#entities/setting'
import { m } from '#paraglide/messages.js'
import { toaster } from '#shared/components'

// Re-exported so `SettingsPage.tsx`'s existing imports keep working.
export type { DesktopNotification, EmailNotification } from '#entities/setting'
export type Density = 'compact' | 'comfortable' | 'spacious'

const SAVE_DELAY_MS = 300

// `framePromise()` must run before any `await` to bind to the action frame, so
// the shared helper performs the API request itself (mirrors pricingModel.ts).
async function saveWithToast<TValues>(
	values: TValues,
	save: (signal: AbortSignal) => Promise<unknown>,
	successTitle: string,
) {
	const id = toaster.create({ title: m.settings_saving(), type: 'loading', closable: false })
	let completed = false
	void framePromise()
		.finally(() => {
			if (!completed) toaster.remove(id)
		})
		.catch(() => {})
	try {
		await wrap(save(abortVar.require().signal))
		await wrap(sleep(SAVE_DELAY_MS))
		toaster.update(id, { title: successTitle, type: 'success' })
		completed = true
	} catch (error) {
		toaster.remove(id)
		throw error
	}
	return values
}

const saveProfileWithToast = (values: ProfileSettings) =>
	saveWithToast(values, (signal) => updateProfile(values, { signal }), m.settings_profile_saved())

const saveNotificationsWithToast = (values: NotificationSettings) =>
	saveWithToast(
		values,
		(signal) => updateNotifications(values, { signal }),
		m.settings_notifications_saved(),
	)

export function reatomSettingsPageModel(data: SettingsData) {
	const profileForm = reatomForm(data.profile, {
		name: 'settings.profileForm',
		onSubmit: async (values) => await wrap(saveProfileWithToast(values)),
	})
	const notificationsForm = reatomForm(data.notifications, {
		name: 'settings.notificationsForm',
		onSubmit: async (values) => await wrap(saveNotificationsWithToast(values)),
	})
	const appearanceForm = reatomForm(
		{ density: 'compact' as Density },
		{
			name: 'settings.appearanceForm',
		},
	)

	const saveProfile = action(async () => {
		if (!profileForm.focus().dirty) return
		try {
			const submitted = await wrap(profileForm.submit())
			profileForm.init(submitted)
		} catch {
			toaster.create({ title: m.settings_save_error(), type: 'error' })
		}
	}, 'settings.profileForm.save').extend(withAbort(), withAsync())

	const saveNotifications = action(async () => {
		if (!notificationsForm.focus().dirty) return
		try {
			const submitted = await wrap(notificationsForm.submit())
			notificationsForm.init(submitted)
		} catch {
			toaster.create({ title: m.settings_save_error(), type: 'error' })
		}
	}, 'settings.notificationsForm.save').extend(withAbort(), withAsync())

	return {
		profileForm,
		saveProfile,
		notificationsForm,
		saveNotifications,
		appearanceForm,
	}
}

export type SettingsPageModel = ReturnType<typeof reatomSettingsPageModel>
