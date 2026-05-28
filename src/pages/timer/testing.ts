import { button, createActor, heading, role, text } from '#shared/test'

export const timerLoc = {
	heading: heading('Timer'),
	display: (value: string | RegExp) => text(value),
	customInput: role('textbox'),
	startButton: button('Start'),
	pauseButton: button('Pause'),
	resetButton: button('Reset'),
	preset10s: button('10s'),
	preset1m: button('1m'),
	preset5m: button('5m'),
	preset10m: button('10m'),
	preset25m: button('25m'),
	preset: (label: '10s' | '1m' | '5m' | '10m' | '25m') => button(label),
}

export const timerActor = createActor().extend((I) => ({
	seeDuration: async (value: string | RegExp) => {
		await I.see(timerLoc.display(value))
	},
	seeTimerContent: async () => {
		await I.see(timerLoc.heading)
		await I.see(timerLoc.display('05:00'))
		await I.see(timerLoc.startButton)
		await I.see(timerLoc.resetButton)
	},
	seePresets: async () => {
		await I.see(timerLoc.preset10s)
		await I.see(timerLoc.preset1m)
		await I.see(timerLoc.preset5m)
		await I.see(timerLoc.preset10m)
		await I.see(timerLoc.preset25m)
	},
	choosePreset: async (label: '10s' | '1m' | '5m' | '10m' | '25m') => {
		await I.click(timerLoc.preset(label))
	},
	start: async () => {
		await I.click(timerLoc.startButton)
	},
	pause: async () => {
		await I.click(timerLoc.pauseButton)
	},
	reset: async () => {
		await I.click(timerLoc.resetButton)
	},
	enterCustomDurationByBlur: async (value: string) => {
		await I.fill(timerLoc.customInput, value)
	},
	enterCustomDurationByEnter: async (value: string) => {
		await I.click(timerLoc.customInput)
		await I.press(value)
		await I.press('[Enter]')
	},
	clearCustomDuration: async () => {
		await I.clear(timerLoc.customInput)
	},
	waitForDuration: async (value: string | RegExp) => {
		await I.retryTo(
			async () => {
				const found = await I.tryTo(() => I.see(timerLoc.display(value)))
				if (!found) throw new Error(`waiting for duration ${String(value)}`)
			},
			5,
			500,
		)
	},
}))
