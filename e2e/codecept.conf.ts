/// <reference types="codeceptjs" />
import { E2E_BASE_URL, startAppServer, stopAppServer } from './support/server.js'

export const config: CodeceptJS.MainConfig = {
	name: 'modern-stack-e2e',
	// Opt out of injected global helper functions (actor/within/session/…).
	// steps_file imports `actor` explicitly; Feature/Scenario/Before and inject()
	// remain available from the Mocha BDD UI. Silences the v4 globals deprecation.
	noGlobals: true,
	tests: './specs/**/*_test.ts',
	output: '../.var/e2e/output',
	// tsx transpiles the TypeScript spec files (config/helpers are handled by
	// CodeceptJS automatically). See https://codecept.io/typescript.
	require: ['tsx/cjs'],
	helpers: {
		Playwright: {
			url: E2E_BASE_URL,
			browser: 'chromium',
			show: process.env['HEADLESS'] === 'false',
			waitForNavigation: 'load',
			waitForTimeout: 15_000,
		},
	},
	include: {
		I: './support/steps_file.ts',
		loginPage: './pages/login.ts',
		dashboardPage: './pages/dashboard.ts',
		articlesPage: './pages/articles.ts',
	},
	bootstrap: startAppServer,
	teardown: stopAppServer,
	plugins: {
		retryFailedStep: { enabled: true },
		screenshot: { enabled: true },
	},
}
