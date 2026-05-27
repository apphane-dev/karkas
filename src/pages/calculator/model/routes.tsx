import { protectedRoute } from '#entities/auth'

import { CalculatorPage } from '../ui/CalculatorPage'

export const calculatorRoute = protectedRoute.reatomRoute(
	{
		path: 'calculator',
		render: () => <CalculatorPage />,
	},
	'calculator',
)
