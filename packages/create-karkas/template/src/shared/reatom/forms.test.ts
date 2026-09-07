import { clearStack, context, reatomField, reatomForm, STACK, wrap } from '@reatom/core'
import { afterEach, expect, test } from 'vite-plus/test'

import {
	formAlertMessage,
	visibleFieldError,
	withFormAutoFocusOnError,
	withFormSubmitHandler,
	withSavedState,
} from './forms'

afterEach(() => context.reset())

// `submit.onFulfill` hooks run in the next cleanup-queue tick, not synchronously
// with the awaited submit promise, so every assertion about post-save state has
// to let the queue flush first.
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

type TestValues = { title: string }

// The template ships no schema validator, so the schema-path tests drive the
// Standard Schema contract directly — reatomForm only calls
// `schema['~standard'].validate(state)` and maps the returned issues by path,
// so a minimal structural implementation stands in for a validator library.
// Typed structurally against the reatomForm `schema` option rather than
// @standard-schema/spec, which is only a transitive (non-importable) dependency.
type TestSchema<State> = {
	'~standard': {
		version: 1
		vendor: 'test'
		validate: (
			value: unknown,
		) => { value: State } | { issues: ReadonlyArray<{ message: string; path?: string[] }> }
	}
}

const requiredFieldsSchema = <State extends Record<string, string>>(
	fields: ReadonlyArray<[keyof State, string]>,
): TestSchema<State> => ({
	'~standard': {
		version: 1,
		vendor: 'test',
		validate: (value) => {
			const state = value as State
			const issues = fields.flatMap(([key, message]) =>
				(state[key] ?? '').trim() ? [] : [{ message, path: [String(key)] }],
			)
			return issues.length > 0 ? { issues } : { value: state }
		},
	},
})

const reatomTestForm = (
	onSubmit: (values: TestValues) => Promise<TestValues | void | null>,
	options?: Parameters<typeof withSavedState>[0],
) => reatomForm({ title: 'saved' }, { name: 'test.form', onSubmit }).extend(withSavedState(options))

test('a saved form rebaselines on the submitted values and reports itself clean', async () => {
	const form = reatomTestForm(async (values) => values)

	form.fields.title.change('edited')
	expect(form.focus().dirty).toBe(true)

	await form.submit()
	await flush()

	expect(form.fields.title.value()).toBe('edited')
	expect(form.focus().dirty).toBe(false)
})

// The failure this guards against: rebaselining on the form's LIVE state would
// adopt whatever was typed while the request was in flight as "saved", so an
// edit that never reached the server would read as clean — and the disclosure
// card would collapse over it, showing a summary row with the old value.
test('an edit typed while the save is in flight stays unsaved', async () => {
	let release: (() => void) | undefined
	const inFlight = new Promise<void>((resolve) => {
		release = resolve
	})
	const form = reatomTestForm(async (values) => {
		await wrap(inFlight)
		return values
	})

	form.fields.title.change('sent')
	const submitted = form.submit()
	// Typed after the request left, so it was never part of the payload.
	form.fields.title.change('typed during save')
	release?.()
	await submitted
	await flush()

	expect(form.fields.title.value()).toBe('typed during save')
	expect(form.focus().dirty).toBe(true)
})

test('onSaved runs once the save resolves, and not on a failed one', async () => {
	let saved = 0
	const form = reatomTestForm(async (values) => values, { onSaved: () => (saved += 1) })
	form.fields.title.change('ok')
	await form.submit()
	await flush()
	expect(saved).toBe(1)

	const failing = reatomTestForm(
		async () => {
			throw new Error('nope')
		},
		{ onSaved: () => (saved += 1) },
	)
	failing.fields.title.change('boom')
	await failing.submit().catch(() => {})
	await flush()
	expect(saved).toBe(1)
})

test('returning nothing clears a write-only form back to its initial baseline', async () => {
	// Write-only forms start empty (nothing to read back) and return null so
	// `withSavedState` resets them rather than rebaselining on the secret.
	const form = reatomForm(
		{ secret: '' },
		{
			name: 'test.writeOnly',
			onSubmit: async () => null,
		},
	).extend(withSavedState())
	form.fields.secret.change('typed-secret')
	await form.submit()
	await flush()

	expect(form.fields.secret.value()).toBe('')
	expect(form.focus().dirty).toBe(false)
})

test('form alert keeps a failure visible when no field owns it', async () => {
	const form = reatomTestForm(async () => {
		throw new Error('Request failed')
	})

	await form.submit().catch(() => {})
	expect(form.validation().errors).toHaveLength(0)
	expect(formAlertMessage(form)).toBe('Request failed')
})

test('a form schema blocks onSubmit and owns the visible field error', async () => {
	let submits = 0
	const form = reatomForm(
		{ title: reatomField('', { name: 'test.validated.title' }) },
		{
			name: 'test.validated',
			validateOnBlur: true,
			keepErrorOnChange: false,
			schema: requiredFieldsSchema<TestValues>([['title', 'Required']]),
			onSubmit: (values) => {
				submits += 1
				return values
			},
		},
	).extend(withFormSubmitHandler())

	await form.submit().catch(() => {})
	expect(submits).toBe(0)
	expect(visibleFieldError(form.fields.title)).toBe('Required')
	expect(formAlertMessage(form)).toBeNull()

	form.fields.title.set('fixed')
	expect(visibleFieldError(form.fields.title)).toBeUndefined()
	expect(formAlertMessage(form)).toBeNull()
	form.fields.title.focus.in()
	form.fields.title.focus.out()
	await flush()

	await form.submit()
	expect(submits).toBe(1)
})

test('submit handler prevents native submission and delegates to form validation', async () => {
	let prevented = 0
	let submits = 0
	const form = reatomForm(
		{ title: 'ready' },
		{ name: 'test.submitHandler', onSubmit: () => (submits += 1) },
	).extend(withFormSubmitHandler())
	const hostHandler = wrap(form.handleSubmit)
	const testStack = [...STACK]
	clearStack()
	try {
		hostHandler({ preventDefault: () => (prevented += 1) })
	} finally {
		STACK.push(...testStack)
	}
	await flush()

	expect(prevented).toBe(1)
	expect(submits).toBe(1)
})

test('auto focus targets the first invalid field after rejected submit', async () => {
	let focused = 0
	const form = reatomForm(
		{ first: '', second: '' },
		{
			name: 'test.autoFocus',
			schema: requiredFieldsSchema<{ first: string; second: string }>([
				['first', 'First is required'],
				['second', 'Second is required'],
			]),
		},
	).extend(withFormAutoFocusOnError())
	form.fields.first.elementRef.set({ focus: () => (focused += 1) })

	await form.submit().catch(() => {})
	await flush()

	expect(focused).toBe(1)
})
