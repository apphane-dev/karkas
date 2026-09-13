import { assert, assign, noop } from '@reatom/core'
import { delay, HttpResponse, type HttpResponseResolver } from 'msw'

import { readPersistedFeatureToggles } from '#shared/model'

function createHttpErrorClass(status: number, name: string) {
	return class extends Error {
		declare stack: string
		constructor(...args: ConstructorParameters<typeof Error>) {
			super(...args)
			this.name = name
			this.stack ??= ''
			return assign(HttpResponse.json({ error: { message: args[0] } }, { status }), this)
		}
	}
}

export const Error400 = createHttpErrorClass(400, 'Error400')
export const Error404 = createHttpErrorClass(404, 'Error404')
export const Error500 = createHttpErrorClass(500, 'Error500')

export const to400 = (message = 'Bad Request') => {
	throw new Error400(message)
}
export const to404 = (message = 'Not Found') => {
	throw new Error404(message)
}
export const to500 = (message = 'Internal Server Error') => {
	throw new Error500(message)
}

// Server-side field validation, FastAPI style. `loc` may carry envelope
// prefixes (e.g. ['body', 'email']) — the client maps issues to form fields
// by field-name suffix.
export const to422 = (issues: Array<{ loc: Array<string | number>; msg: string }>) => {
	throw HttpResponse.json({ detail: issues }, { status: 422 })
}

export function withRetrySuccess<TResolver extends HttpResponseResolver>(
	resolver: TResolver,
	failures = 2,
): TResolver {
	let errorCount = 0

	return ((info: Parameters<TResolver>[0]) => {
		assert(errorCount++ >= failures, 'Simulated server error', Error500)
		return resolver(info)
	}) as TResolver
}

export async function neverResolve(): Promise<never> {
	return new Promise(noop)
}

/**
 * Handler latency gated by the `slow-mocks` feature toggle. Under vitest the
 * toggle is bypassed so stories and unit tests keep their deterministic,
 * 'real'-length delay.
 */
export async function mockDelay() {
	if (
		(globalThis as Record<string, unknown>)['__vitest_worker__'] ||
		readPersistedFeatureToggles().includes('slow-mocks')
	) {
		await delay('real')
	}
}
