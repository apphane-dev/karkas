import type { Canvas } from 'kahraman'

import {
	button,
	createActor,
	heading,
	role,
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
		const seeSaveError = (section: typeof settingsLoc.profileForm) =>
			I.retryTo(() => I.see(role('alert').within(section)), 25)

		return {
			seeSettingsContent: async () => {
				await I.see(settingsLoc.heading)
				await I.see(settingsLoc.profileSection)
				await I.see(settingsLoc.notificationsSection)
				await I.see(settingsLoc.appearanceSection)
			},
			saveProfile: async () => saveSection(settingsLoc.profileForm),
			saveNotifications: async () => saveSection(settingsLoc.notificationsForm),
			// A save is confirmed by the state change itself: the save affordance
			// disappears because the form reads clean — there is no toast.
			savedProfileClearsDirty: async (section: typeof settingsLoc.profileForm) => {
				await I.retryTo(
					() =>
						I.scope(section, async () => {
							await I.dontSee(settingsLoc.saveButton)
						}),
					25,
				)
			},
			seeSaveError,
		}
	})
