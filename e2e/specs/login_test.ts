Feature('Authentication')

Scenario('redirects an anonymous visitor to the login screen', ({ I, loginPage }) => {
	I.amOnPage('/')
	I.seeInCurrentUrl('/login')
	loginPage.seeLoginForm()
})

Scenario('rejects invalid credentials', ({ loginPage }) => {
	loginPage.open()
	loginPage.submitCredentials('alex@example.com', 'wrong-password')
	loginPage.seeInvalidCredentialsError()
})

Scenario('signs in with valid credentials and lands on the dashboard', ({ I, dashboardPage }) => {
	I.loginAsUser()
	dashboardPage.seeDashboard()
})
