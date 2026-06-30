import preview from '#.storybook/preview'
import { App } from '#app/App'
import { SETTINGS_API_PATH } from '#entities/setting/api/settingsApi'
import { settingsFetch, settingsProfile } from '#entities/setting/mocks/handlers'
import { settingsActor as I, settingsLoc as loc } from '#pages/settings/testing'
import { button, link, role, text } from '#shared/test'
import {
	createRouteFetchAbortProbe,
	expectRouteFetchAbortOnNavigation,
	routeFetchAbortLifecycle,
} from '#shared/test/routeFetchAbortProbe'

const settingsFetchAbortProbe = createRouteFetchAbortProbe(SETTINGS_API_PATH, 'settings')

const meta = preview.meta({
	title: 'Integration/Settings',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'settings',
	},
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

// Wait for the initial GET /settings loading skeleton (role="status" in the
// canvas) to clear before asserting. Safe to use on every story whose first
// paint is the loading state.
const waitForLoad = () => I.waitExit(role('status'))

export const Default = meta.story({ name: 'Default', play: waitForLoad })

Default.test('renders settings heading', async () => {
	await I.see(loc.heading)
})

Default.test('renders Profile section', async () => {
	await I.see(loc.profileSection)
})

Default.test('renders Notifications section', async () => {
	await I.see(loc.notificationsSection)
})

Default.test('renders Top Bar section', async () => {
	await I.see(loc.topBarSection)
})

Default.test('renders Appearance section', async () => {
	await I.see(loc.appearanceSection)
})

Default.test('renders profile form fields with initial values', async () => {
	await I.seeInField(role('textbox', 'Display name'), 'Alex Johnson')
	await I.seeInField(role('textbox', 'Email'), 'alex@example.com')
})

Default.test('renders role field as admin', async () => {
	await I.see(text('Admin'))
})

Default.test('renders notification select values', async () => {
	await I.see(role('combobox', 'Email notifications'))
	await I.see(role('combobox', 'Desktop notifications'))
})

Default.test('renders appearance select values', async () => {
	await I.see(role('combobox', 'Theme'))
	await I.see(role('combobox', 'Density'))
	await I.see(role('combobox', 'Language'))
})

Default.test('save button is not shown when form is clean', async () => {
	await I.dontSee(button('Save changes'))
})

export const EditProfileShowsSave = meta.story({
	name: 'Edit Profile Shows Save',
	play: waitForLoad,
})

EditProfileShowsSave.test('save button appears after editing profile', async () => {
	await I.dontSee(button('Save changes'))
	await I.fill(role('textbox', 'Display name'), 'Jane Doe')
	await I.see(button('Save changes'))
})

EditProfileShowsSave.test('save button disappears after saving', async () => {
	await I.fill(role('textbox', 'Display name'), 'Jane Doe')
	await I.see(button('Save changes'))
	await I.saveProfile()
	await I.seeProfileSavedToast()
	await I.dontSee(button('Save changes'))
})

export const ToggleSwitches = meta.story({ name: 'Toggle Switches', play: waitForLoad })

ToggleSwitches.test('can toggle language switcher', async () => {
	const toggle = role('checkbox', 'Language switcher in top bar')
	await I.seeChecked(toggle)
	await I.click(toggle)
	await I.dontSeeChecked(toggle)
})

ToggleSwitches.test('can toggle GitHub link', async () => {
	const toggle = role('checkbox', 'Show GitHub Link')
	await I.click(toggle)
	await I.dontSeeChecked(toggle)
})

ToggleSwitches.test('can toggle theme switcher', async () => {
	const toggle = role('checkbox', 'Show Theme Switcher')
	await I.click(toggle)
	await I.dontSeeChecked(toggle)
})

export const ChangeTheme = meta.story({ name: 'Change Theme', play: waitForLoad })

ChangeTheme.test('can change theme preference to dark', async () => {
	await I.selectOption(role('combobox', 'Theme'), 'Dark')
})

ChangeTheme.test('can change theme preference to light', async () => {
	await I.selectOption(role('combobox', 'Theme'), 'Light')
})

export const ChangeDensity = meta.story({ name: 'Change Density', play: waitForLoad })

ChangeDensity.test('can change density to comfortable', async () => {
	await I.selectOption(role('combobox', 'Density'), 'Comfortable')
})

ChangeDensity.test('can change density to spacious', async () => {
	await I.selectOption(role('combobox', 'Density'), 'Spacious')
})

export const ChangeNotificationPreference = meta.story({
	name: 'Change Notification Preference',
	play: waitForLoad,
})

ChangeNotificationPreference.test('can change email notification to important only', async () => {
	await I.selectOption(role('combobox', 'Email notifications'), 'Important only')
})

ChangeNotificationPreference.test('can change email notification to none', async () => {
	await I.selectOption(role('combobox', 'Email notifications'), 'None')
})

ChangeNotificationPreference.test('can change desktop notification to disabled', async () => {
	await I.selectOption(role('combobox', 'Desktop notifications'), 'Disabled')
})

ChangeNotificationPreference.test(
	'save button appears after changing notification preference',
	async () => {
		await I.dontSee(button('Save changes'))
		await I.selectOption(role('combobox', 'Email notifications'), 'Important only')
		await I.see(button('Save changes'))
	},
)

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
	play: waitForLoad,
})

DefaultMobile.test('[mobile] renders settings heading', async () => {
	await I.see(loc.heading)
})

DefaultMobile.test('[mobile] renders all sections', async () => {
	await I.seeSettingsContent()
})

DefaultMobile.test('[mobile] renders profile form fields', async () => {
	await I.seeInField(role('textbox', 'Display name'), 'Alex Johnson')
	await I.seeInField(role('textbox', 'Email'), 'alex@example.com')
})

// ---------- new coverage ----------

export const AbortsPendingSettingsRequestOnNavigation = meta.story({
	name: 'Aborts Pending Settings Request On Navigation',
	beforeEach: routeFetchAbortLifecycle(settingsFetchAbortProbe),
	parameters: {
		msw: { handlers: { settingsFetch: settingsFetch.loading } },
	},
})

AbortsPendingSettingsRequestOnNavigation.test(
	'aborts the pending settings request when navigating away',
	async () => {
		await expectRouteFetchAbortOnNavigation(settingsFetchAbortProbe, () => I.click(link('Timer')), {
			assertLoading: () => I.seeLoading(),
		})
	},
)

export const LoadingState = meta.story({
	name: 'Loading State',
	parameters: {
		msw: { handlers: { settingsFetch: settingsFetch.loading } },
	},
})

LoadingState.test('shows loading state while settings are pending', async () => {
	await I.seeLoading()
	await I.dontSee(loc.heading)
})

export const ServerError = meta.story({
	name: 'Server Error',
	play: waitForLoad,
	parameters: {
		msw: { handlers: { settingsFetch: settingsFetch.error } },
	},
})

ServerError.test('shows error state when settings request fails', async () => {
	await I.seeError()
})

export const RetrySuccess = meta.story({
	name: 'Retry Success',
	play: waitForLoad,
	parameters: {
		msw: { handlers: { settingsFetch: settingsFetch.retrySucceeds() } },
	},
})

RetrySuccess.test('loads settings after retry succeeds', async () => {
	await I.seeError()
	await I.retry()
	await I.waitExit(role('status'))
	await I.seeSettingsContent()
})

export const SaveProfileSuccess = meta.story({ name: 'Save Profile', play: waitForLoad })

SaveProfileSuccess.test('saving profile shows success toast and clears dirty', async () => {
	await I.fill(role('textbox', 'Display name'), 'Jane Doe')
	await I.see(button('Save changes'))
	await I.saveProfile()
	await I.seeProfileSavedToast()
	await I.dontSee(button('Save changes'))
	await I.seeInField(role('textbox', 'Display name'), 'Jane Doe')
})

export const SaveNotificationsSuccess = meta.story({
	name: 'Save Notifications',
	play: waitForLoad,
})

SaveNotificationsSuccess.test(
	'saving notifications shows success toast and clears dirty',
	async () => {
		await I.selectOption(role('combobox', 'Email notifications'), 'Important only')
		await I.see(button('Save changes'))
		await I.saveNotifications()
		await I.seeNotificationsSavedToast()
		await I.dontSee(button('Save changes'))
	},
)

export const SaveProfileError = meta.story({
	name: 'Save Profile Error',
	play: waitForLoad,
	parameters: {
		msw: { handlers: { settingsProfile: settingsProfile.error } },
	},
})

SaveProfileError.test('save server error shows error toast and keeps dirty', async () => {
	await I.fill(role('textbox', 'Display name'), 'Jane Doe')
	await I.saveProfile()
	await I.seeSaveErrorToast()
	await I.see(button('Save changes'))
})
