import preview from '#.storybook/preview'
import { App } from '#app/App'
import { timerActor as I, timerLoc as loc } from '#pages/timer/testing'
import { button, link, role, text } from '#shared/test'

const meta = preview.meta({
	title: 'Integration/Timer',
	component: App,
	parameters: { layout: 'fullscreen', initialPath: 'timer' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({ name: 'Default' })

Default.test('renders timer heading', async () => {
	await I.see(loc.heading)
})

Default.test('renders default timer display', async () => {
	await I.see(text('05:00'))
})

Default.test('renders start and reset buttons', async () => {
	await I.see(loc.startButton)
	await I.see(loc.resetButton)
})

Default.test('renders preset buttons', async () => {
	await I.seePresets()
})

Default.test('renders custom duration input', async () => {
	await I.see(role('textbox'))
})

export const StartPauseReset = meta.story({ name: 'Start Pause Reset' })

StartPauseReset.test('starts, pauses, and resets the timer', async () => {
	await I.see(text('05:00'))

	await I.click(loc.startButton)
	await I.see(loc.pauseButton)
	await I.dontSee(button('Start'))

	await I.click(loc.resetButton)
	await I.see(text('05:00'))
	await I.see(loc.startButton)
	await I.dontSee(button('Pause'))
})

export const PresetChangesDuration = meta.story({ name: 'Preset Changes Duration' })

PresetChangesDuration.test('clicking a preset changes the displayed duration', async () => {
	await I.click(loc.preset10s)
	await I.see(text('00:10'))

	await I.click(loc.preset1m)
	await I.see(text('01:00'))

	await I.click(loc.preset5m)
	await I.see(text('05:00'))

	await I.click(loc.preset10m)
	await I.see(text('10:00'))

	await I.click(loc.preset25m)
	await I.see(text('25:00'))
})

export const CustomDurationInput = meta.story({ name: 'Custom Duration Input' })

CustomDurationInput.test('entering MM:SS commits via blur', async () => {
	await I.fill(role('textbox'), '00:15')
	await I.see(text('00:15'))
})

CustomDurationInput.test('entering MM:SS commits via Enter key', async () => {
	const input = role('textbox')
	await I.click(input)
	await I.press('00:20')
	await I.press('[Enter]')
	await I.see(text('00:20'))
})

CustomDurationInput.test('entering invalid input does not change duration', async () => {
	await I.click(loc.preset10s)
	await I.see(text('00:10'))
	await I.clear(role('textbox'))
	await I.fill(role('textbox'), '00:00')
	// Duration should not change — still 00:10 from the preset
	await I.see(text('00:10'))
})

export const PresetsDisabledWhileRunning = meta.story({ name: 'Presets Disabled While Running' })

PresetsDisabledWhileRunning.test('preset buttons are disabled while timer is running', async () => {
	await I.click(loc.startButton)

	await I.seeDisabled(loc.preset10s)
})

export const TimerReachesZero = meta.story({ name: 'Timer Reaches Zero' })

TimerReachesZero.test('start button is disabled after timer reaches zero', async () => {
	await I.fill(role('textbox'), '00:01')
	await I.see(text('00:01'))

	await I.click(loc.startButton)
	await I.see(loc.pauseButton)

	await I.retryTo(
		async () => {
			const found = await I.tryTo(() => I.see(text('00:00')))
			if (!found) throw new Error('waiting for zero')
		},
		5,
		500,
	)

	await I.seeDisabled(loc.startButton)
})

export const TimerTicksInSidebarOnOtherRoute = meta.story({
	name: 'Timer Ticks In Sidebar On Other Route',
})

TimerTicksInSidebarOnOtherRoute.test(
	'timer counts down in sidebar after navigating away',
	async () => {
		await I.click(loc.preset10s)
		await I.see(text('00:10'))
		await I.click(loc.startButton)
		await I.see(loc.pauseButton)

		await I.click(link('Dashboard'))
		await I.waitExit(role('status'))

		await I.see(text(/00:0\d/).wait())
	},
)

export const DefaultMobile = meta.story({
	name: 'Default (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
})

DefaultMobile.test('[mobile] renders timer heading', async () => {
	await I.see(loc.heading)
})

DefaultMobile.test('[mobile] renders timer content', async () => {
	await I.seeTimerContent()
})

DefaultMobile.test('[mobile] renders preset buttons', async () => {
	await I.seePresets()
})

export const StartPauseResetMobile = meta.story({
	name: 'Start Pause Reset (Mobile)',
	globals: { viewport: { value: 'sm', isRotated: false } },
})

StartPauseResetMobile.test('[mobile] starts, pauses, and resets the timer', async () => {
	await I.see(text('05:00'))

	await I.click(loc.startButton)
	await I.see(loc.pauseButton)

	await I.click(loc.resetButton)
	await I.see(text('05:00'))
	await I.see(loc.startButton)
})
