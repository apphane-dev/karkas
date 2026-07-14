import { inject } from 'codeceptjs'

const { I } = inject()

/**
 * Authenticated app-shell page object: dashboard assertions plus sidebar
 * navigation shared by scenarios that run after login.
 */
export default {
	seeDashboard() {
		I.seeInCurrentUrl('/dashboard')
		I.see('Dashboard')
		// Widgets render once the MSW-delayed dashboard request resolves.
		I.waitForText('Weekly Traffic', 15)
		I.see('Recent Activity')
		I.see('Top Pages')
	},

	/** Click a primary sidebar entry by its visible label (e.g. "Articles"). */
	goToSection(label: string) {
		I.click(label)
	},
}
