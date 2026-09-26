import { reatomField, reatomForm } from '@reatom/core'
import { expect, test } from 'vite-plus/test'

import { ApiValidationError } from './errors'
import { applyApiValidationToFields } from './validation'

const validationError = (issues: Array<{ loc: Array<string | number>; msg: string }>) =>
	new ApiValidationError(422, { detail: issues })

const formWithFields = () =>
	reatomForm({
		email: reatomField('', { name: 'test.serverFields.email' }),
		password: reatomField('', { name: 'test.serverFields.password' }),
	})

test('a server issue lands under its field as a server-sourced error', () => {
	const form = formWithFields()
	const unmapped = applyApiValidationToFields(
		validationError([{ loc: ['body', 'email'], msg: 'Already registered' }]),
		form.fields,
	)

	expect(unmapped).toEqual([])
	expect(form.fields.email.validation.errors().at(-1)).toEqual({
		source: 'server',
		message: 'Already registered',
	})
})

test('issue locs match by field-name suffix, so envelope prefixes still map', () => {
	const form = formWithFields()
	// `body.email` and `user.credentials.password` both end in a field name.
	const unmapped = applyApiValidationToFields(
		validationError([
			{ loc: ['body', 'email'], msg: 'a' },
			{ loc: ['user', 'credentials', 'password'], msg: 'b' },
		]),
		form.fields,
	)
	expect(unmapped).toEqual([])
	expect(form.fields.email.validation.errors()).toHaveLength(1)
	expect(form.fields.password.validation.errors()).toHaveLength(1)
})

test('issues no field claims are returned unmapped instead of dropped', () => {
	const form = formWithFields()
	const unmapped = applyApiValidationToFields(
		validationError([{ loc: ['billing', 'vat_id'], msg: 'Invalid VAT ID' }]),
		form.fields,
	)
	expect(unmapped).toHaveLength(1)
	expect(unmapped[0]?.msg).toBe('Invalid VAT ID')
})

test('re-mapping clears the previous server errors first, so they never pile up', () => {
	const form = formWithFields()
	applyApiValidationToFields(validationError([{ loc: ['email'], msg: 'first' }]), form.fields)
	applyApiValidationToFields(validationError([{ loc: ['email'], msg: 'second' }]), form.fields)
	expect(form.fields.email.validation.errors()).toHaveLength(1)
	expect(form.fields.email.validation.errors().at(-1)?.message).toBe('second')
})

test('non-validation errors are ignored, leaving field state untouched', () => {
	const form = formWithFields()
	const before = form.fields.email.validation.errors().length
	expect(applyApiValidationToFields(new Error('network down'), form.fields)).toEqual([])
	expect(form.fields.email.validation.errors().length).toBe(before)
})

// The point of the keepErrorOnChange merge: a server error is the only error a
// field cannot re-check by editing, so without the next-keystroke drop it
// would block every later submit locally. Editing must clear it and hand the
// verdict back to the server.
test('a mapped server error is dropped by the next edit to the field', async () => {
	const form = formWithFields()
	applyApiValidationToFields(
		validationError([{ loc: ['email'], msg: 'Already registered' }]),
		form.fields,
	)
	expect(form.fields.email.validation.errors().length).toBe(1)

	form.fields.email.change('someone-else@example.com')
	await new Promise((resolve) => setTimeout(resolve, 0))

	expect(form.fields.email.validation.errors().length).toBe(0)
})
