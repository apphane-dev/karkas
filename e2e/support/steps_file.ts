import { actor } from 'codeceptjs'

/**
 * Custom actor steps shared across scenarios.
 *
 * `I.loginAsUser()` signs in through the real login form against the MSW-mocked
 * auth endpoint (see src/entities/auth/mocks/handlers.ts). Default credentials
 * match src/entities/auth/mocks/data.ts.
 */
export default () =>
	actor({
		loginAsUser(this: CodeceptJS.I, email = 'alex@example.com', password = 'password') {
			this.amOnPage('/login')
			this.fillField('Email', email)
			this.fillField('Password', password)
			this.click('Sign in')
			this.waitInUrl('/dashboard', 15)
		},
	})
