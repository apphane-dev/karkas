import { addGlobalExtension, isAbort, isAction, withCallHook } from '@reatom/core'

interface CollectedAbortError {
	actionName: string
	message: string
}

export interface DrainAbortError extends CollectedAbortError {
	count: number
}

const collected: CollectedAbortError[] = []

export function clearAbortErrors() {
	collected.length = 0
}

export function drainAbortErrors(): DrainAbortError[] {
	const grouped = new Map<string, DrainAbortError>()

	for (const error of collected) {
		const key = `${error.actionName}\0${error.message}`
		const existing = grouped.get(key)
		if (existing) {
			existing.count += 1
		} else {
			grouped.set(key, { ...error, count: 1 })
		}
	}

	collected.length = 0
	return [...grouped.values()]
}

export const formatAbortErrors = (errors: DrainAbortError[]) =>
	errors.map((e) => `  - ${e.actionName}: ${e.message} ×${e.count}`).join('\n')

const flushMicrotasks = async () => {
	await Promise.resolve()
	await new Promise<void>((resolve) => queueMicrotask(resolve))
}

const isRouteLoaderAbort = (error: DrainAbortError, routeName: string) =>
	error.actionName.includes(routeName) && error.actionName.endsWith('.loader.onReject')

/**
 * Positive regression check for reatom/reatom#1294: a route loader aborting
 * with `unmatch` (when its route stops matching) must NOT surface on the
 * public `*.loader.onReject` action. Call this right after a teardown
 * navigation. Passes while the fix is in place; throws loudly if it regresses
 * (e.g. running against unpatched @reatom/core).
 */
export async function assertNoRouteLoaderAbortErrors(routeName: string) {
	await flushMicrotasks()
	const routeAborts = drainAbortErrors().filter((error) => isRouteLoaderAbort(error, routeName))
	if (routeAborts.length > 0) {
		throw new Error(
			`Route loader for "${routeName}" surfaced AbortError(s) on onReject:\n${formatAbortErrors(routeAborts)}`,
		)
	}
}

const rejectionError = (payload: unknown): unknown =>
	typeof payload === 'object' && payload !== null && 'error' in payload ? payload.error : undefined

const recordAbort = (actionName: string, payload: unknown) => {
	const error = rejectionError(payload)
	if (isAbort(error)) {
		collected.push({ actionName, message: error.message })
	}
}

addGlobalExtension((target) => {
	if (isAction(target) && target.name.endsWith('.onReject')) {
		target.extend(withCallHook((payload) => recordAbort(target.name, payload)))
	}
	return target
})
