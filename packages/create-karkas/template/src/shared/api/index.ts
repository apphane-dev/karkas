import { abortVar } from '@reatom/core'

import { createApiError } from './errors'

export {
	// fallow-ignore-next-line unused-export
	ApiAuthError,
	// fallow-ignore-next-line unused-export
	ApiError,
	// fallow-ignore-next-line unused-export
	ApiValidationError,
	// fallow-ignore-next-line unused-export
	createApiError,
	isApiError,
	isApiValidationError,
	// fallow-ignore-next-line unused-type
	type ApiValidationIssue,
} from './errors'
export { applyApiValidationToFields } from './validation'

const API_PREFIX = '/api'

export function composeApiUrl(path = '') {
	if (path === '' || path === '/') {
		return API_PREFIX
	}
	const normalized = path.startsWith('/') ? path : `/${path}`
	return `${API_PREFIX}${normalized}`
}

type RequestOptions = Omit<RequestInit, 'body'> & {
	body?: unknown
}

async function parseResponsePayload(response: Response) {
	if (response.status === 204) {
		return null
	}

	const contentType = response.headers.get('content-type') ?? ''
	if (contentType.includes('application/json')) {
		return response.json()
	}
	return response.text()
}

// Reads the ambient Reatom abort controller. Outside any Reatom frame (this app
// uses strict clearStack context) there is no implicit cancellation.
function frameAbortSignal(): AbortSignal | undefined {
	try {
		return abortVar.get()?.signal
	} catch {
		return undefined
	}
}

async function request<TResponse>(path: string, options: RequestOptions = {}) {
	const { body, headers, ...restOptions } = options

	const requestHeaders = new Headers(headers)
	if (body !== undefined && !requestHeaders.has('Content-Type')) {
		requestHeaders.set('Content-Type', 'application/json')
	}

	const requestInit = {
		...restOptions,
		signal: restOptions.signal ?? frameAbortSignal() ?? null,
		headers: requestHeaders,
		...(body !== undefined ? { body: JSON.stringify(body) } : {}),
	} satisfies RequestInit

	const response = await fetch(composeApiUrl(path), requestInit)

	const payload = await parseResponsePayload(response)
	if (!response.ok) {
		throw createApiError(response, payload)
	}

	return payload as TResponse
}

export const apiClient = {
	get: <TResponse>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
		request<TResponse>(path, { ...options, method: 'GET' }),
	post: <TResponse>(path: string, options?: Omit<RequestOptions, 'method'>) =>
		request<TResponse>(path, { ...options, method: 'POST' }),
}
