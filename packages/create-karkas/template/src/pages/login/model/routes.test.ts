import { expect, test, vi } from 'vite-plus/test'

import { reatomLoginForm } from './routes'

const json422 = (issues: Array<{ loc: Array<string | number>; msg: string }>) =>
	new Response(JSON.stringify({ detail: issues }), {
		status: 422,
		headers: { 'Content-Type': 'application/json' },
	})

const submitAgainst = async (issues: Array<{ loc: Array<string | number>; msg: string }>) => {
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => json422(issues)),
	)
	const form = reatomLoginForm()
	form.fields.email.change('alex@example.com')
	form.fields.password.change('password')
	await form.submit().catch(() => {})
	return form
}

test.afterEach(() => {
	vi.unstubAllGlobals()
})

// A 422 whose issues all name known fields is fully "handled": every message
// lives under its field, so the page-level alert must stay out.
test('a fully mapped 422 is handled', async () => {
	const form = await submitAgainst([
		{ loc: ['body', 'email'], msg: 'already registered' },
		{ loc: ['password'], msg: 'too weak' },
	])
	expect(form.isErrorHandled(form.submit.error())).toBe(true)
	expect(form.unmappedIssues()).toHaveLength(0)
})

// A record-level issue (no field matches `loc`) is the one failure no field
// can carry: without this, the 422 would fail silently — no field error and
// an alert that considered itself redundant.
test('a 422 with an unmapped issue is not handled', async () => {
	const form = await submitAgainst([{ loc: ['record'], msg: 'sign-up disabled' }])
	expect(form.isErrorHandled(form.submit.error())).toBe(false)
	expect(form.unmappedIssues()).toEqual([{ loc: ['record'], msg: 'sign-up disabled' }])
})

test('a mixed 422 keeps the unmapped leftover and is not handled', async () => {
	const form = await submitAgainst([
		{ loc: ['body', 'email'], msg: 'already registered' },
		{ loc: ['record'], msg: 'sign-up disabled' },
	])
	expect(form.isErrorHandled(form.submit.error())).toBe(false)
	expect(form.unmappedIssues()).toHaveLength(1)
	expect(form.isErrorHandled({ name: 'TypeError', message: 'network down' })).toBe(false)
})
