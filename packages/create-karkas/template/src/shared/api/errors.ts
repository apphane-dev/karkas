type ErrorDetail = string | Record<string, string> | Array<unknown>
type ErrorPayload =
	| { detail: ErrorDetail }
	| { error: ErrorDetail | Array<unknown> | { message?: string } }
	| Record<string, unknown>

export type ApiValidationIssue = {
	type?: string
	loc: Array<string | number>
	msg: string
	input?: unknown
}

export class ApiError extends Error {
	readonly status: number
	readonly payload: unknown
	readonly code: string | null

	constructor(status: number, payload: unknown, message?: string) {
		const code = extractErrorCode(payload)
		super(message ?? code ?? `API request failed with status ${status}`)
		this.name = 'ApiError'
		this.status = status
		this.payload = payload
		this.code = code
	}
}

export class ApiAuthError extends ApiError {
	constructor(payload: unknown) {
		super(401, payload, 'Authentication is required')
		this.name = 'ApiAuthError'
	}
}

export class ApiValidationError extends ApiError {
	readonly issues: Array<ApiValidationIssue>

	constructor(status: number, payload: unknown) {
		super(status, payload, 'Request validation failed')
		this.name = 'ApiValidationError'
		this.issues = extractValidationIssues(payload)
	}
}

export function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError
}

export function isApiValidationError(error: unknown): error is ApiValidationError {
	return error instanceof ApiValidationError
}

function isValidationIssue(value: unknown): value is ApiValidationIssue {
	if (!value || typeof value !== 'object') return false
	const issue = value as Partial<ApiValidationIssue>
	return Array.isArray(issue.loc) && typeof issue.msg === 'string'
}

function extractValidationIssues(payload: unknown): Array<ApiValidationIssue> {
	if (!payload || typeof payload !== 'object') return []
	const data = payload as ErrorPayload
	const source = 'error' in data ? data.error : 'detail' in data ? data.detail : []
	return Array.isArray(source) ? source.filter(isValidationIssue) : []
}

function extractErrorCode(payload: unknown): string | null {
	if (!payload || typeof payload !== 'object') return null
	const data = payload as ErrorPayload
	if ('detail' in data) {
		const { detail } = data
		if (typeof detail === 'string') return detail
		if (Array.isArray(detail) && detail.length > 0) return 'VALIDATION_ERROR'
		if (detail && typeof detail === 'object' && 'code' in detail) {
			return typeof detail.code === 'string' ? detail.code : null
		}
	}
	if ('error' in data) {
		const { error } = data
		if (typeof error === 'string') return error
		if (error && !Array.isArray(error) && typeof error === 'object' && 'message' in error) {
			return typeof error.message === 'string' ? error.message : null
		}
		if (Array.isArray(error) && error.length > 0) return 'VALIDATION_ERROR'
	}
	return null
}

export function createApiError(response: Response, payload: unknown) {
	if (response.status === 401) return new ApiAuthError(payload)
	if (
		response.status === 422 ||
		(payload && typeof payload === 'object' && 'error' in payload && Array.isArray(payload.error))
	) {
		return new ApiValidationError(response.status, payload)
	}
	return new ApiError(response.status, payload)
}
