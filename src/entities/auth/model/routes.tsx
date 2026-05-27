import { urlAtom } from '@reatom/core'
import { createElement, Fragment } from 'react'

import { createAppPath, rootRoute } from '#shared/router'

import { isAuthenticatedAtom } from './auth'

const loginPath = createAppPath('login')

export const protectedRoute = rootRoute.reatomRoute(
	{
		layout: true,
		params: () => {
			if (isAuthenticatedAtom()) return {}
			if (urlAtom().pathname !== loginPath) urlAtom.go(loginPath, true)
			return null
		},
		render: (self) => self.outlet().filter(Boolean).at(-1) ?? createElement(Fragment),
	},
	'protectedRoute',
)
