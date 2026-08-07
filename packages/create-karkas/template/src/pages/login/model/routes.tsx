import { urlAtom, reatomForm } from '@reatom/core'
import { Fragment } from 'react'

import { isAuthenticatedAtom, loginAction } from '#entities/auth'
import { createAppPath, rootRoute } from '#shared/router'

import { LoginPage } from '../ui/LoginPage'

const dashboardPath = createAppPath('dashboard')

const reatomLoginForm = () =>
	reatomForm(
		{ email: 'alex@example.com', password: 'password' },
		{ name: 'loginForm', onSubmit: loginAction },
	)

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
