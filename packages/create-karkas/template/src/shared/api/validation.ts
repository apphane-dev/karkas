import type { Action, ArrayAtom } from '@reatom/core'

import { type ApiValidationIssue, isApiValidationError } from './errors'

type FieldWithValidation = {
	options: { merge: (patch: { keepErrorOnChange: boolean }) => unknown }
	validation: {
		clearErrors: Action<[...sources: Array<string>], unknown>
		errors: ArrayAtom<{ source: string; message: string }>
	}
}

type FieldRecord = Record<string, FieldWithValidation>

const SERVER_VALIDATION_SOURCE = 'server'

export function applyApiValidationToFields(
	error: unknown,
	fields: FieldRecord,
): Array<ApiValidationIssue> {
	if (!isApiValidationError(error)) return []

	for (const field of Object.values(fields)) {
		field.validation.clearErrors(SERVER_VALIDATION_SOURCE)
	}

	const unmapped: Array<ApiValidationIssue> = []
	for (const issue of error.issues) {
		const fieldName = findIssueFieldName(issue, fields)
		if (!fieldName) {
			unmapped.push(issue)
			continue
		}
		const field = fields[fieldName]
		if (!field) continue
		field.validation.errors.push({
			source: SERVER_VALIDATION_SOURCE,
			message: issue.msg,
		})
		// A server error is the only kind a field cannot re-check on its own, so
		// unless editing clears it the field stays invalid forever — and the form
		// refuses every later submit locally, without ever asking the server again.
		// `keepErrorOnChange: false` makes the next keystroke drop it; the server
		// gets to judge the new value on the next submit.
		field.options.merge({ keepErrorOnChange: false })
	}
	return unmapped
}

function findIssueFieldName(issue: ApiValidationIssue, fields: FieldRecord) {
	const loc = issue.loc.map(String)
	for (let index = 0; index < loc.length; index++) {
		const suffix = loc.slice(index).join('.')
		if (suffix in fields) return suffix
	}
	for (let index = loc.length - 1; index >= 0; index--) {
		const segment = loc[index]
		if (segment && segment in fields) return segment
	}
	return null
}
