import { expect } from 'storybook/test'

import preview from '#.storybook/preview'
import { button, createActor, heading, role, text } from '#shared/test'

import { TimerPage } from './TimerPage'

const timerHeading = heading('Timer')
const startBtn = button('Start')
const pauseBtn = button('Pause')
const resetBtn = button('Reset')
const durationBtn = (label: string) => button(label)

const I = createActor()

const meta = preview.meta({
	title: 'Pages/Timer',
	component: TimerPage,
	parameters: { layout: 'centered' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({ name: 'Default' })

Default.test('renders timer heading and initial duration', async () => {
	await I.see(timerHeading)
	await I.see(text('05:00'))
})

export const TimerControls = meta.story({ name: 'Timer Controls' })

TimerControls.test('starts, pauses, and resets', async () => {
	await I.click(startBtn)
	await I.see(pauseBtn)

	await I.click(pauseBtn)
	await I.see(startBtn)

	await I.click(resetBtn)
	await I.see(text('05:00'))
})

export const DurationPresets = meta.story({ name: 'Duration Presets' })

DurationPresets.test('changes duration via preset buttons', async () => {
	await I.click(durationBtn('1m'))
	await I.see(text('01:00'))

	await I.click(durationBtn('10m'))
	await I.see(text('10:00'))

	await I.click(durationBtn('5m'))
	await I.see(text('05:00'))
})

export const CustomDuration = meta.story({ name: 'Custom Duration' })

CustomDuration.test('custom time input starts empty', async () => {
	const customInput = role('textbox')

	expect(await I.grabValueFrom(customInput)).toBe('')
	await I.dontSeeInField(customInput, '05:00')
})
