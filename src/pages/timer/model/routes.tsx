import { protectedRoute } from '#entities/auth'

import { TimerPage } from '../ui/TimerPage'

export const timerRoute = protectedRoute.reatomRoute(
	{
		path: 'timer',
		render: () => <TimerPage />,
	},
	'timer',
)
