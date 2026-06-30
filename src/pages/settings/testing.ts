import {
	button,
	createActor,
	heading,
	role,
	text,
	withPageError,
	withRetryAndLoading,
} from '#shared/test'

export const settingsLoc = {
	heading: heading('Settings'),
	profileSection: heading('Profile'),
	notificationsSection: heading('Notifications'),
	topBarSection: heading('Top Bar'),
	appearanceSection: heading('Appearance'),
	saveButton: button('Save changes'),
}

export const settingsActor = createActor()
	.extend(withRetryAndLoading('Loading settings'))
	.extend(
		withPageError({
			title: 'Could not load settings',
			description: "We couldn't load your settings. Try again in a moment.",
		}),
	)
	.extend((I) => ({
		seeSettingsContent: async () => {
			await I.see(settingsLoc.heading)
			await I.see(settingsLoc.profileSection)
			await I.see(settingsLoc.notificationsSection)
			await I.see(settingsLoc.appearanceSection)
		},
		save: async () => {
			await I.click(button('Save changes'))
		},
		seeProfileSavedToast: async () => {
			// The "Saving…" loading toast is transient and the global toaster is
			// shared across stories, so observe it best-effort, then firmly wait
			// for the persistent "Profile saved" success toast.
			await I.tryTo(() => I.retryTo(() => I.see(role('status', 'Saving…').within('global')), 5))
			await I.retryTo(() => I.see(role('status', 'Profile saved').within('global')), 25)
		},
		seeNotificationsSavedToast: async () => {
			await I.tryTo(() => I.retryTo(() => I.see(role('status', 'Saving…').within('global')), 5))
			await I.retryTo(
				() => I.see(role('status', 'Notification preferences saved').within('global')),
				25,
			)
		},
		seeSaveErrorToast: async () => {
			await I.retryTo(() => I.see(text("Couldn't save. Try again.").within('global')), 25)
		},
	}))
