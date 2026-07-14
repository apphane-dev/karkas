import { inject } from 'codeceptjs'

const { I } = inject()

/**
 * Login screen page object. Strings mirror messages/en/auth.json — keep them in
 * sync with the product copy rather than inventing test-only text.
 */
export default {
	fields: {
		email: 'Email',
		password: 'Password',
	},
	submit: 'Sign in',

	open() {
		I.amOnPage('/login')
	},

	fillCredentials(email: string, password: string) {
		I.fillField(this.fields.email, email)
		I.fillField(this.fields.password, password)
	},

	submitCredentials(email: string, password: string) {
		this.fillCredentials(email, password)
		I.click(this.submit)
	},

	seeLoginForm() {
		I.see('Sign in')
		I.see('Use your workspace credentials to continue.')
		I.seeElement('input[type="email"]')
		I.seeElement('input[type="password"]')
	},

	seeInvalidCredentialsError() {
		// The auth mock rejects after a network delay, so wait for the alert.
		I.waitForText('Could not sign in', 10)
		I.see('Check your email and password, then try again.')
	},
}
