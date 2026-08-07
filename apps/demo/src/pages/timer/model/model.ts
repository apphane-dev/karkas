import {
	action,
	atom,
	computed,
	reatomBoolean,
	sleep,
	withAbort,
	withChangeHook,
	wrap,
} from '@reatom/core'

function parseCustomDuration(input: string) {
	const [rawMinutes = '0', rawSeconds = '0'] = input.split(':')
	const minutes = Number.parseInt(rawMinutes, 10)
	const seconds = Number.parseInt(rawSeconds, 10)
	const duration = minutes * 60 + seconds

	if (Number.isNaN(minutes) || Number.isNaN(seconds) || duration <= 0) {
		return null
	}
	return duration
}

const reatomTimer = (initialDuration = 300, name = 'timer') => {
	const duration = atom(initialDuration, `${name}.duration`)
	const remaining = atom(initialDuration, `${name}.remaining`)
	let endTime = 0

	const tick = action(async () => {
		while (true) {
			await wrap(sleep(1000))
			const left = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
			remaining.set(left)
			if (left <= 0) {
				running.setFalse()
				return
			}
		}
	}, `${name}.tick`).extend(withAbort())

	const running = reatomBoolean(false, `${name}.running`).extend(
		withChangeHook((isRunning) => {
			if (isRunning) {
				if (remaining() <= 0) {
					running.setFalse()
					return
				}
				endTime = Date.now() + remaining() * 1000
				tick()
			} else {
				tick.abort()
				if (endTime > 0) {
					remaining.set(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)))
					endTime = 0
				}
			}
		}),
	)

	const progress = computed(
		() => (duration() === 0 ? 0 : remaining() / duration()),
		`${name}.progress`,
	)

	const formatted = computed(() => {
		const s = remaining() % 60
		return `${String(Math.trunc(remaining() / 60)).padStart(2, '0')}:${String(s).padStart(2, '0')}`
	}, `${name}.formatted`)

	const reset = action(() => {
		tick.abort()
		running.setFalse()
		remaining.set(duration())
		endTime = 0
	}, `${name}.reset`)

	const setDuration = action((seconds: number) => {
		duration.set(seconds)
		if (!running()) {
			remaining.set(seconds)
		}
	}, `${name}.setDuration`)

	const commitCustomDuration = action((input: string) => {
		const parsed = parseCustomDuration(input)
		if (parsed !== null) setDuration(parsed)
	}, `${name}.commitCustomDuration`)

	return {
		remaining,
		running,
		progress,
		duration,
		formatted,
		reset,
		setDuration,
		commitCustomDuration,
	}
}

export const timer = reatomTimer(300, 'timer')
