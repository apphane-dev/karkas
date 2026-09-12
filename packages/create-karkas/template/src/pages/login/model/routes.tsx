import { reatomField, reatomForm, urlAtom, wrap } from '@reatom/core'
import { atom } from '@reatom/core'
import { Fragment } from 'react'

import { isAuthenticatedAtom, loginAction } from '#entities/auth'
import { m } from '#paraglide/messages.js'
import {
	applyApiValidationToFields,
	type ApiValidationIssue,
	isApiValidationError,
} from '#shared/api'
import { withFormAutoFocusOnError, withFormSubmitHandler } from '#shared/reatom'
import { createAppPath, rootRoute } from '#shared/router'

import { LoginPage } from '../ui/LoginPage'

const dashboardPath = createAppPath('dashboard')

export const reatomLoginForm = () => {
	// Issues no field claims. The page suppresses its alert only when a
	// validation error is fully handled — every issue mapped onto a field.
	// Unmapped or mixed responses keep the alert, otherwise a record-level 422
	// would fail silently: no field error anywhere and an alert that considers
	// itself redundant.
	const unmappedIssues = atom<Array<ApiValidationIssue>>([], 'loginForm.unmappedIssues')

	const fields = {
		email: reatomField('alex@example.com', {
			name: 'loginForm.email',
			// Loose shape only — the backend is the source of truth for real
			// address validity; this catches obviously malformed input before
			// a round-trip.
			validate: ({ state }) => {
				const value = state.trim()
				if (!value) return m.login_email_required()
				if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return m.login_email_invalid()
				return undefined
			},
		}),
		password: reatomField('password', {
			name: 'loginForm.password',
			validate: ({ state }) => (state ? undefined : m.login_password_required()),
		}),
	}

	return reatomForm(fields, {
		name: 'loginForm',
		validateOnBlur: true,
		keepErrorOnChange: false,
		onSubmit: async (values) => {
			try {
				return await wrap(loginAction(values))
			} catch (error) {
				// Server validation issues surface under their fields; whatever no
				// field claims is kept here so the page's alert can own it.
				unmappedIssues.set(applyApiValidationToFields(error, fields))
				throw error
			}
		},
	})
		.extend(withFormSubmitHandler(), withFormAutoFocusOnError())
		.extend(() => ({
			unmappedIssues,
			isErrorHandled: (error: unknown): boolean =>
				isApiValidationError(error) && unmappedIssues().length === 0,
		}))
}

export type LoginForm = ReturnType<typeof reatomLoginForm>

export const loginRoute = rootRoute.reatomRoute(
	{
		path: 'login',
		params: () => {
			if (!isAuthenticatedAtom()) return {}
			urlAtom.go(dashboardPath, true)
			return null
		},
		async loader() {
			return { loginForm: reatomLoginForm() }
		},
		render(self) {
			const { isFulfilled, data } = self.loader.status()
			return isFulfilled ? <LoginPage form={data.loginForm} /> : <Fragment key="loading" />
		},
	},
	'login',
)
