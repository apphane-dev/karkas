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
	await I.seeDuration('05:00')
})

Default.test('renders start and reset buttons', async () => {
	await I.see(loc.startButton)
	await I.see(loc.resetButton)
})

Default.test('renders preset buttons', async () => {
	await I.seePresets()
})

Default.test('renders custom duration input', async () => {
	await I.see(loc.customInput)
})

export const StartPauseReset = meta.story({ name: 'Start Pause Reset' })

StartPauseReset.test('starts, pauses, and resets the timer', async () => {
	await I.seeDuration('05:00')

	await I.start()
	await I.see(loc.pauseButton)
	await I.dontSee(button('Start'))

	await I.reset()
	await I.seeDuration('05:00')
	await I.see(loc.startButton)
	await I.dontSee(button('Pause'))
})

export const PresetChangesDuration = meta.story({ name: 'Preset Changes Duration' })

PresetChangesDuration.test('clicking a preset changes the displayed duration', async () => {
	await I.choosePreset('10s')
	await I.seeDuration('00:10')

	await I.choosePreset('1m')
	await I.seeDuration('01:00')

	await I.choosePreset('5m')
	await I.seeDuration('05:00')

	await I.choosePreset('10m')
	await I.seeDuration('10:00')

	await I.choosePreset('25m')
	await I.seeDuration('25:00')
})

export const CustomDurationInput = meta.story({ name: 'Custom Duration Input' })

CustomDurationInput.test('entering MM:SS commits via blur', async () => {
	await I.enterCustomDurationByBlur('00:15')
	await I.seeDuration('00:15')
})

CustomDurationInput.test('entering MM:SS commits via Enter key', async () => {
	await I.enterCustomDurationByEnter('00:20')
	await I.seeDuration('00:20')
})

CustomDurationInput.test('entering invalid input does not change duration', async () => {
	await I.choosePreset('10s')
	await I.seeDuration('00:10')
	await I.clearCustomDuration()
	await I.enterCustomDurationByBlur('00:00')
	// Duration should not change — still 00:10 from the preset
	await I.seeDuration('00:10')
})

export const PresetsDisabledWhileRunning = meta.story({ name: 'Presets Disabled While Running' })

PresetsDisabledWhileRunning.test('preset buttons are disabled while timer is running', async () => {
	await I.start()

	await I.seeDisabled(loc.preset10s)
})

export const TimerReachesZero = meta.story({ name: 'Timer Reaches Zero' })

TimerReachesZero.test('start button is disabled after timer reaches zero', async () => {
	await I.enterCustomDurationByBlur('00:01')
	await I.seeDuration('00:01')

	await I.start()
	await I.see(loc.pauseButton)
	await I.waitForDuration('00:00')
	await I.seeDisabled(loc.startButton)
})

export const TimerTicksInSidebarOnOtherRoute = meta.story({
	name: 'Timer Ticks In Sidebar On Other Route',
})

TimerTicksInSidebarOnOtherRoute.test(
	'timer counts down in sidebar after navigating away',
	async () => {
		await I.choosePreset('10s')
		await I.seeDuration('00:10')
		await I.start()
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
	await I.seeDuration('05:00')

	await I.start()
	await I.see(loc.pauseButton)

	await I.reset()
	await I.seeDuration('05:00')
	await I.see(loc.startButton)
})
