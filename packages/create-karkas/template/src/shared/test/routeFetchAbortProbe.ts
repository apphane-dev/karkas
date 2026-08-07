import { composeApiUrl } from '#shared/api'

type FetchInput = Parameters<typeof window.fetch>[0]
type FetchSignal = RequestInit['signal']

type Deferred = {
	promise: Promise<void>
	resolve: () => void
}

type RouteFetchAbortProbe = {
	install: () => void
	restore: () => void
	waitForStart: () => Promise<void>
	waitForAbort: () => Promise<void>
	label: string
}

type RouteFetchAbortOptions = {
	assertLoading?: () => Promise<unknown>
	timeoutMs?: number
}

const createDeferred = (): Deferred => {
	let resolve: () => void = () => undefined
	const promise = new Promise<void>((done) => {
		resolve = done
	})
	return { promise, resolve }
}

const rejectAfter = (ms: number, message: string) => {
	let timeout: ReturnType<typeof globalThis.setTimeout> | undefined
	const promise = new Promise<never>((_, reject) => {
		timeout = globalThis.setTimeout(() => reject(new Error(message)), ms)
	})
	return {
		clear: () => {
			if (timeout !== undefined) globalThis.clearTimeout(timeout)
		},
		promise,
	}
}

const withTimeout = async <T>(promise: Promise<T>, ms: number, message: string) => {
	const timeout = rejectAfter(ms, message)
	try {
		return await Promise.race([promise, timeout.promise])
	} finally {
		timeout.clear()
	}
}

const requestUrl = (input: FetchInput) =>
	typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

const normalizedApiUrl = (apiPath: string) =>
	apiPath.startsWith('/api/') || apiPath === '/api' ? apiPath : composeApiUrl(apiPath)

export function createRouteFetchAbortProbe(apiPath: string, label = apiPath): RouteFetchAbortProbe {
	const url = normalizedApiUrl(apiPath)
	let restoreFetch = () => undefined
	let started = createDeferred()
	let aborted = createDeferred()

	const reset = () => {
		started = createDeferred()
		aborted = createDeferred()
	}

	const watchSignal = (signal: FetchSignal) => {
		if (!signal) return
		if (signal.aborted) aborted.resolve()
		else signal.addEventListener('abort', aborted.resolve, { once: true })
	}

	reset()

	return {
		label,
		install: () => {
			restoreFetch()
			reset()
			const originalFetch = window.fetch
			window.fetch = ((input, init) => {
				if (requestUrl(input).includes(url)) {
					started.resolve()
					watchSignal(init?.signal)
				}
				return originalFetch.call(window, input, init)
			}) satisfies typeof window.fetch
			restoreFetch = () => {
				window.fetch = originalFetch
				restoreFetch = () => undefined
			}
		},
		restore: () => restoreFetch(),
		waitForStart: () => started.promise,
		waitForAbort: () => aborted.promise,
	}
}

export const routeFetchAbortLifecycle = (probe: RouteFetchAbortProbe) => () => {
	probe.install()
	return () => probe.restore()
}

export async function expectRouteFetchAbortOnNavigation(
	probe: RouteFetchAbortProbe,
	navigateAway: () => Promise<void>,
	options: RouteFetchAbortOptions = {},
) {
	const timeoutMs = options.timeoutMs ?? 1_000
	await withTimeout(
		probe.waitForStart(),
		timeoutMs,
		`${probe.label} request did not start before navigation`,
	)
	await options.assertLoading?.()
	await navigateAway()
	await withTimeout(
		probe.waitForAbort(),
		timeoutMs,
		`${probe.label} request signal was not aborted after navigation`,
	)
}
