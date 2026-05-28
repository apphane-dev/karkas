import type { Canvas } from '#shared/test/loc'

import preview from '#.storybook/preview'
import { App } from '#app/App'
import { authHandlers } from '#entities/auth/mocks/handlers'
import { button, createActor, heading, role, text } from '#shared/test'

const I = createActor()

const field = (name: string) => (canvas: Canvas) => canvas.getByLabelText(name)

const meta = preview.meta({
	title: 'Integration/Auth',
	component: App,
	parameters: { layout: 'fullscreen', authenticated: false, initialPath: 'login' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Login = meta.story({
	name: 'Login',
})

Login.test('renders sign in form', async () => {
	await I.see(heading('Sign in'))
	await I.see(field('Email'))
	await I.see(field('Password'))
	await I.see(button('Sign in'))
})

Login.test('signs in and opens the dashboard', async () => {
	await I.click(button('Sign in'))
	await I.waitExit(button('Signing in'))
	await I.see(heading('Dashboard').wait())
})

export const RedirectsProtectedRoutes = meta.story({
	name: 'Redirects Protected Routes',
	parameters: { authenticated: false, initialPath: 'dashboard' },
})

RedirectsProtectedRoutes.test(
	'redirects unauthenticated protected route visits to login',
	async () => {
		await I.see(heading('Sign in'))
		await I.dontSee(heading('Dashboard'))
	},
)

export const HandlesLoginError = meta.story({
	name: 'Login Error',
	parameters: {
		msw: {
			handlers: { authLogin: authHandlers.loginError },
		},
	},
})

HandlesLoginError.test('shows an error when server fails', async () => {
	await I.click(button('Sign in'))
	await I.waitExit(button('Signing in'))
	await I.see(role('alert'))
	await I.see(text('Check your email and password, then try again.'))
})

export const HandlesInvalidCredentials = meta.story({
	name: 'Invalid Credentials',
})

HandlesInvalidCredentials.test('shows an error with wrong credentials', async () => {
	await I.clear(field('Email'))
	await I.fill(field('Email'), 'wrong@example.com')
	await I.click(button('Sign in'))
	await I.waitExit(button('Signing in'))
	await I.see(role('alert'))
	await I.see(text('Check your email and password, then try again.'))
})

export const SignOut = meta.story({
	name: 'Sign Out',
	parameters: { authenticated: true, initialPath: 'dashboard' },
	play: () => I.waitExit(role('status')),
})

SignOut.test('signs out and returns to login', async () => {
	await I.see(heading('Dashboard'))
	await I.click(button(/Acme Inc/))
	await I.click(role('menuitem', /Sign out/).wait())
	await I.see(heading('Sign in').wait())
})

export const SignOutWhenApiFails = meta.story({
	name: 'Sign Out When API Fails',
	parameters: {
		authenticated: true,
		initialPath: 'dashboard',
		msw: {
			handlers: { authLogout: authHandlers.logoutError },
		},
	},
	play: () => I.waitExit(role('status')),
})

SignOutWhenApiFails.test(
	'clears session and returns to login even when logout API fails',
	async () => {
		await I.see(heading('Dashboard'))
		await I.click(button(/Acme Inc/))
		await I.click(role('menuitem', /Sign out/).wait())
		await I.see(heading('Sign in').wait())
	},
)
