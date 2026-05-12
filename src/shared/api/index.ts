const API_PREFIX = '/api'

export function composeApiUrl(path = '') {
	if (path === '' || path === '/') {
		return API_PREFIX
	}
	const normalized = path.startsWith('/') ? path : `/${path}`
	return `${API_PREFIX}${normalized}`
}

class ApiError extends Error {
	readonly status: number
	readonly payload: unknown

	constructor(status: number, payload: unknown) {
		super(`API request failed with status ${status}`)
		this.name = 'ApiError'
		this.status = status
		this.payload = payload
	}
}

export function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError
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

async function request<TResponse>(path: string, options: RequestOptions = {}) {
	const { body, headers, ...restOptions } = options

	const requestHeaders = new Headers(headers)
	if (body !== undefined && !requestHeaders.has('Content-Type')) {
		requestHeaders.set('Content-Type', 'application/json')
	}

	const requestInit: RequestInit = {
		...restOptions,
		headers: requestHeaders,
	}
	if (body !== undefined) {
		requestInit.body = JSON.stringify(body)
	}

	const response = await fetch(composeApiUrl(path), requestInit)

	const payload = await parseResponsePayload(response)
	if (!response.ok) {
		throw new ApiError(response.status, payload)
	}

	return payload as TResponse
}

export const apiClient = {
	get: <TResponse>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
		request<TResponse>(path, { ...options, method: 'GET' }),
	post: <TResponse>(path: string, options?: Omit<RequestOptions, 'method'>) =>
		request<TResponse>(path, { ...options, method: 'POST' }),
	patch: <TResponse>(path: string, options?: Omit<RequestOptions, 'method'>) =>
		request<TResponse>(path, { ...options, method: 'PATCH' }),
	delete: <TResponse>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
		request<TResponse>(path, { ...options, method: 'DELETE' }),
}
