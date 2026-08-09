import type { Canvas } from 'kahraman'

import {
	button,
	createActor,
	heading,
	role,
	text,
	withPageError,
	withRetryAndLoading,
} from '#shared/test'

const sectionByHeading = (name: string) => (canvas: Canvas) => {
	const section = canvas.getByRole('heading', { name }).closest('fieldset')
	if (!(section instanceof HTMLElement)) throw new Error(`Settings section not found: ${name}`)
	return section
}

export const settingsLoc = {
	heading: heading('Settings'),
	profileSection: heading('Profile'),
	notificationsSection: heading('Notifications'),
	topBarSection: heading('Top Bar'),
	appearanceSection: heading('Appearance'),
	profileForm: sectionByHeading('Profile'),
	notificationsForm: sectionByHeading('Notifications'),
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
	.extend((I) => {
		const saveSection = (section: typeof settingsLoc.profileForm) =>
			I.scope(section, async () => {
				await I.click(settingsLoc.saveButton)
			})
		const seeSavedToast = async (title: string) => {
			// The "Saving…" loading toast is transient and the global toaster is
			// shared across stories, so observe it best-effort, then firmly wait
			// for the persistent success toast.
			await I.tryTo(() => I.retryTo(() => I.see(role('status', 'Saving…').within('global')), 5))
			await I.retryTo(() => I.see(role('status', title).within('global')), 25)
		}

		return {
			seeSettingsContent: async () => {
				await I.see(settingsLoc.heading)
				await I.see(settingsLoc.profileSection)
				await I.see(settingsLoc.notificationsSection)
				await I.see(settingsLoc.appearanceSection)
			},
			saveProfile: async () => saveSection(settingsLoc.profileForm),
			saveNotifications: async () => saveSection(settingsLoc.notificationsForm),
			seeProfileSavedToast: async () => seeSavedToast('Profile saved'),
			seeNotificationsSavedToast: async () => seeSavedToast('Notification preferences saved'),
			seeSaveErrorToast: async () => {
				await I.retryTo(() => I.see(text("Couldn't save. Try again.").within('global')), 25)
			},
		}
	})
