import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

const testTimeout = Number(process.env['TEST_TIMEOUT'])
const coverageThresholds = {
	lines: Number(process.env['COVERAGE_THRESHOLD_LINES']),
	branches: Number(process.env['COVERAGE_THRESHOLD_BRANCHES']),
	functions: Number(process.env['COVERAGE_THRESHOLD_FUNCTIONS']),
	statements: Number(process.env['COVERAGE_THRESHOLD_STATEMENTS']),
}

export default defineConfig({
	optimizeDeps: {
		include: ['react', 'react/jsx-dev-runtime'],
	},
	test: {
		globals: true,
		coverage: {
			provider: 'v8',
			reportsDirectory: '.var/coverage',
			include: ['src/**/*.{ts,tsx}'],
			exclude: [
				'src/**/*.stories.tsx',
				'src/**/*.test.{ts,tsx}',
				'src/shared/styled-system/**',
				'src/shared/components/ui/**',
				'src/main.tsx',
			],
			thresholds: coverageThresholds,
		},
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					include: ['src/**/*.test.{ts,tsx}'],
					exclude: ['src/**/*.stories.tsx'],
					testTimeout: testTimeout,
					hookTimeout: testTimeout,
					environment: 'node',
				},
			},
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({
						configDir: path.join(path.dirname(fileURLToPath(import.meta.url)), '.storybook'),
					}),
				],
				test: {
					name: 'storybook',
					testTimeout: testTimeout,
					hookTimeout: testTimeout,
					browser: {
						enabled: true,
						headless: true,
						// Artifact-on-failure, mirroring a CodeceptJS-style reporter
						// (see docs/testing.md, Failure diagnostics). Screenshots land in
						// __screenshots__/ next to the story file (gitignored).
						screenshotFailures: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' }],
					},
				},
			},
		],
	},
} as never)
