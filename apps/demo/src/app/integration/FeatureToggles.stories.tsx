import preview from '#.storybook/preview'
import { App } from '#app/App'
import { FEATURE_TOGGLES_STORAGE_KEY } from '#shared/model'
import { createActor, role, text } from '#shared/test'

const I = createActor()

// Each story owns its localStorage state: the app reads persisted toggles at
// startup, and storybook's browser shares localStorage across stories.
const seedToggles = (values: string[]) => {
	localStorage.clear()
	localStorage.setItem(
		FEATURE_TOGGLES_STORAGE_KEY,
		JSON.stringify({
			data: values,
			id: 'story',
			timestamp: Date.now(),
			to: Date.now() + 60_000,
			version: 0,
		}),
	)
}

const meta = preview.meta({
	title: 'Integration/Feature Toggles',
	component: App,
	parameters: {
		layout: 'fullscreen',
		initialPath: 'articles',
	},
})

export default meta

const badgeToggle = role('checkbox', 'show-beta-badge')
const slowMocksToggle = role('checkbox', 'slow-mocks')

export const NoTogglesPersisted = meta.story({
	name: 'No toggles persisted',
	loaders: [async () => seedToggles([])],
})

NoTogglesPersisted.test('shows the panel with every switch off', async () => {
	await I.see(slowMocksToggle)
	await I.dontSeeChecked(slowMocksToggle)
	await I.dontSeeChecked(badgeToggle)
	await I.dontSee(text('beta'))
})

export const PersistedToggles = meta.story({
	name: 'Persisted toggles and live switching',
	loaders: [async () => seedToggles(['slow-mocks'])],
})

PersistedToggles.test('restores toggles from storage at startup', async () => {
	await I.seeChecked(slowMocksToggle)
	await I.dontSeeChecked(badgeToggle)
})

PersistedToggles.test('switching a toggle applies it immediately', async () => {
	await I.click(badgeToggle)
	await I.see(text('beta'))
	await I.seeChecked(badgeToggle)
	await I.click(badgeToggle)
	await I.dontSee(text('beta'))
	await I.dontSeeChecked(badgeToggle)
})
