Feature('Dashboard')

Before(({ I }) => {
	I.loginAsUser()
})

Scenario('shows the dashboard overview widgets', ({ dashboardPage }) => {
	dashboardPage.seeDashboard()
})
