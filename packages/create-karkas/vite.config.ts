import { defineConfig } from 'vite-plus'

export default defineConfig({
	fmt: {
		useTabs: true,
		tabWidth: 2,
		semi: false,
		singleQuote: true,
		trailingComma: 'all',
		sortPackageJson: { sortScripts: true },
	},
	lint: {
		ignorePatterns: ['dist/**', 'template/**'],
		categories: {
			correctness: 'error',
			suspicious: 'warn',
			pedantic: 'off',
			perf: 'warn',
			style: 'off',
			restriction: 'off',
			nursery: 'off',
		},
		options: {
			typeAware: true,
			typeCheck: true,
		},
	},
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts'],
	},
})
