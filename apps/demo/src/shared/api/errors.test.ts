import { expect, test } from 'vite-plus/test'

import { ApiAuthError, ApiError, ApiValidationError, createApiError, isApiError } from './errors'

const response = (status: number) => new Response(null, { status })

test('401 payloads become ApiAuthError', () => {
	const error = createApiError(response(401), { detail: 'Token expired' })
	expect(error).toBeInstanceOf(ApiAuthError)
	expect(error.message).toBe('Authentication is required')
	expect(isApiError(error)).toBe(true)
})

test('422 payloads become ApiValidationError carrying extracted issues', () => {
	const error = createApiError(response(422), {
		detail: [{ loc: ['body', 'email'], msg: 'Invalid address' }],
	})
	if (!(error instanceof ApiValidationError)) throw new Error('expected ApiValidationError')
	expect(error.issues).toEqual([{ loc: ['body', 'email'], msg: 'Invalid address' }])
})

// Some backends signal validation with a 400 carrying an issues array instead
// of a 422 — the array shape alone selects ApiValidationError.
test('a non-422 payload with an error array is still a validation error', () => {
	const error = createApiError(response(400), {
		error: [{ loc: ['password'], msg: 'Too short' }],
	})
	if (!(error instanceof ApiValidationError)) throw new Error('expected ApiValidationError')
	expect(error.issues).toHaveLength(1)
})

test('a plain error object becomes the message; a string becomes the code', () => {
	expect(
		createApiError(response(400), { error: { message: 'Invalid email or password' } }).message,
	).toBe('Invalid email or password')
	expect(createApiError(response(403), { detail: 'FORBIDDEN' }).code).toBe('FORBIDDEN')
	expect(createApiError(response(500), null).message).toBe('API request failed with status 500')
})

test('validation extraction drops entries that are not issues', () => {
	const error = new ApiValidationError(422, {
		detail: [{ loc: ['email'], msg: 'Required' }, 'not-an-issue', { msg: 'no loc' }, 42],
	})
	expect(error.issues).toEqual([{ loc: ['email'], msg: 'Required' }])
})

test('a scalar error payload carries no code', () => {
	expect(new ApiError(500, 'boom').code).toBeNull()
	expect(new ApiError(500, ['unexpected array']).code).toBeNull()
})
