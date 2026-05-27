import { urlAtom } from '@reatom/core'

import { isAuthenticatedAtom } from '#entities/auth'
import { createAppPath, rootRoute } from '#shared/router'

import { LoginPage } from '../ui/LoginPage'

const dashboardPath = createAppPath('dashboard')

export const loginRoute = rootRoute.reatomRoute(
	{
		path: 'login',
		params: () => {
			if (!isAuthenticatedAtom()) return {}
			urlAtom.go(dashboardPath, true)
			return null
		},
		render: () => <LoginPage onSuccess={() => urlAtom.go(dashboardPath, true)} />,
	},
	'login',
)
