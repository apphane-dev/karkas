import { afterEach, expect, test, vi } from 'vite-plus/test'

import { ApiError, createApiError } from './errors'
import { apiClient } from './index'

const response = (status: number) => new Response(null, { status })

afterEach(() => {
	vi.unstubAllGlobals()
})

// Every shape `extractErrorCode` understands. The naive version only reads
// `error.message`; real backends send FastAPI `detail` strings, FastAPI
// validation arrays, and envelope `{ error: { code } }` objects.
test('error codes across payload shapes', () => {
	// detail: string is the code itself
	expect(createApiError(response(403), { detail: 'FORBIDDEN' }).code).toBe('FORBIDDEN')
	// detail: non-empty array means validation
	expect(new ApiError(500, { detail: [{ msg: 'x' }] }).code).toBe('VALIDATION_ERROR')
	// detail: empty array carries nothing
	expect(new ApiError(500, { detail: [] }).code).toBeNull()
	// detail: envelope object with a code
	expect(new ApiError(500, { detail: { code: 'ORG_SUSPENDED' } }).code).toBe('ORG_SUSPENDED')
	// detail: envelope object with a non-string code
	expect(new ApiError(500, { detail: { code: 7 } }).code).toBeNull()
	// error: string
	expect(new ApiError(500, { error: 'SOMETHING_ELSE' }).code).toBe('SOMETHING_ELSE')
	// error: envelope object with a message
	expect(new ApiError(500, { error: { message: 'nope' } }).code).toBe('nope')
	// error: envelope object with a non-string message
	expect(new ApiError(500, { error: { message: 42 } }).code).toBeNull()
	// error: non-empty array means validation
	expect(new ApiError(500, { error: [{ msg: 'x' }] }).code).toBe('VALIDATION_ERROR')
	// error: empty array carries nothing
	expect(new ApiError(500, { error: [] }).code).toBeNull()
	// an object with neither key carries nothing
	expect(new ApiError(500, { status: 'down' }).code).toBeNull()
})

const jsonHttpResponse = (status: number, body: unknown) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	})

test('request sends a JSON body with the content type set once', async () => {
	const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
		jsonHttpResponse(200, { ok: true }),
	)
	vi.stubGlobal('fetch', fetchMock)

	await apiClient.post('/things', { body: { name: 'x' } })

	const init = fetchMock.mock.calls[0]?.[1] as RequestInit
	const headers = init.headers as Headers
	expect(headers.get('Content-Type')).toBe('application/json')
	expect(init.body).toBe(JSON.stringify({ name: 'x' }))
})

test('request without a body sets no content type and passes no body', async () => {
	const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
		jsonHttpResponse(200, []),
	)
	vi.stubGlobal('fetch', fetchMock)

	await apiClient.get('/things')

	const init = fetchMock.mock.calls[0]?.[1] as RequestInit
	expect((init.headers as Headers).get('Content-Type')).toBeNull()
	expect(init.body).toBeUndefined()
})

test('a 204 response parses to null; a text response parses as text', async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => new Response(null, { status: 204 })),
	)
	expect(await apiClient.get('/things')).toBeNull()

	vi.stubGlobal(
		'fetch',
		vi.fn(async () => new Response('ok-text', { status: 200 })),
	)
	expect(await apiClient.get('/things')).toBe('ok-text')
})

test('an error response throws the mapped ApiError', async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => jsonHttpResponse(403, { detail: 'FORBIDDEN' })),
	)

	await expect(apiClient.get('/things')).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 })
})
