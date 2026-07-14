Feature('Sidebar navigation')

Before(({ I }) => {
	I.loginAsUser()
})

Scenario('opens Articles from the sidebar', ({ I, dashboardPage }) => {
	dashboardPage.goToSection('Articles')
	I.seeInCurrentUrl('/articles')
})

Scenario('opens Settings from the sidebar', ({ I, dashboardPage }) => {
	dashboardPage.goToSection('Settings')
	I.seeInCurrentUrl('/settings')
})
