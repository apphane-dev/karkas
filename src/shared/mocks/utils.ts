import { assert, assign, noop } from '@reatom/core'
import { HttpResponse, type HttpResponseResolver } from 'msw'

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
