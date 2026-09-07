import type { SettingsData } from '#entities/setting'

import { abortVar, reatomForm, wrap } from '@reatom/core'

import { updateNotifications, updateProfile } from '#entities/setting'
import { withSavedState } from '#shared/reatom'

// Re-exported so `SettingsPage.tsx`'s existing imports keep working.
export type { DesktopNotification, EmailNotification } from '#entities/setting'
export type Density = 'compact' | 'comfortable' | 'spacious'

export function reatomSettingsPageModel(data: SettingsData) {
	// Both forms stay on screen after a save, so `withSavedState` owns the
	// post-save state: the returned payload rebaselines the form (an edit typed
	// mid-save survives and keeps it dirty), and the save affordance disappears
	// because the form reads clean — no toast claiming the save.
	const profileForm = reatomForm(data.profile, {
		name: 'settings.profileForm',
		onSubmit: async (values) => {
			await wrap(updateProfile(values, { signal: abortVar.require().signal }))
			return values
		},
	}).extend(withSavedState())

	const notificationsForm = reatomForm(data.notifications, {
		name: 'settings.notificationsForm',
		onSubmit: async (values) => {
			await wrap(updateNotifications(values, { signal: abortVar.require().signal }))
			return values
		},
	}).extend(withSavedState())

	const appearanceForm = reatomForm(
		{ density: 'compact' as Density },
		{
			name: 'settings.appearanceForm',
		},
	)

	return {
		profileForm,
		notificationsForm,
		appearanceForm,
	}
}

export type SettingsPageModel = ReturnType<typeof reatomSettingsPageModel>
