import { protectedRoute } from '#shared/router'

import { CalculatorPage } from '../ui/CalculatorPage'

export const calculatorRoute = protectedRoute.reatomRoute(
	{
		path: 'calculator',
		render: () => <CalculatorPage />,
	},
	'calculator',
)
