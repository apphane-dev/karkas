import { paraglideVitePlugin } from '@inlang/paraglide-js'
import react from '@vitejs/plugin-react'
import assert from 'node:assert'
import { defineConfig } from 'vite-plus'

const outDir = process.env['WEBAPP_OUT_DIR']
const base = process.env['WEBAPP_BASE_URL']
assert(outDir, 'WEBAPP_OUT_DIR env var is not set')
assert(base, 'WEBAPP_BASE_URL env var is not set')

export default defineConfig({
	fmt: {
		useTabs: true,
		tabWidth: 2,
		semi: false,
		singleQuote: true,
		trailingComma: 'all',
		sortImports: {
			internalPattern: ['#'],
			partitionByComment: true,
			groups: [
				'side_effect',
				'side_effect_style',
				'type',
				['builtin', 'external'],
				['internal', 'subpath'],
				['parent', 'sibling', 'index'],
				'style',
				'unknown',
			],
		},
		sortPackageJson: { sortScripts: true },
		ignorePatterns: ['public/mockServiceWorker.js'],
	},
	lint: {
		ignorePatterns: ['scripts/steiger/**'],
		plugins: ['import', 'react'],
		categories: {
			correctness: 'error',
			suspicious: 'warn',
			pedantic: 'off',
			perf: 'warn',
			style: 'off',
			restriction: 'off',
			nursery: 'off',
		},
		rules: {
			'import/no-cycle': 'error',
			'eslint/no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'react',
							importNames: [
								'useEffect',
								'useLayoutEffect',
								'useMemo',
								'useCallback',
								'useState',
								'useRef',
								'useContext',
								'useReducer',
								'useImperativeHandle',
								'useDebugValue',
								'memo',
							],
							message: 'Find appropriate solution with reatom or ask user for guidance.',
						},
					],
				},
			],
			'react/react-in-jsx-scope': 'off',
			'import/no-unassigned-import': 'off',
			'eslint/no-await-in-loop': 'off',
			'eslint/no-underscore-dangle': 'off',
			'vite-plus/prefer-vite-plus-imports': 'error',
		},
		overrides: [
			{
				files: ['**/shared/components/ui/**'],
				rules: {
					'eslint/no-shadow': 'off',
				},
			},
		],
		options: {
			typeAware: true,
			typeCheck: true,
		},
		jsPlugins: [
			{
				name: 'vite-plus',
				specifier: 'vite-plus/oxlint-plugin',
			},
		],
	},
	build: {
		outDir,
		rolldownOptions: {
			output: {
				codeSplitting: {
					groups: [
						{
							name: 'react-vendor',
							test: /node_modules[\\/](react|react-dom)([\\/]|$)/,
							priority: 30,
						},
						{
							name: 'vendor-msw',
							test: /node_modules[\\/](msw|@mswjs|@open-draft|headers-polyfill|is-node-process|outvariant|strict-event-emitter)([\\/]|$)/,
							priority: 20,
						},
						{
							name: 'ui-vendor',
							test: /node_modules[\\/](@ark|@ui|@zag-js)/,
							priority: 15,
						},
						{
							name: 'vendor',
							test: /node_modules/,
							priority: 10,
						},
						{
							name: 'common',
							minShareCount: 2,
							minSize: 10000,
							priority: 5,
						},
					],
				},
			},
		},
	},
	plugins: [
		react(),
		paraglideVitePlugin({ project: './project.inlang', outdir: './src/paraglide' }),
	],
	// Compile-time constant so the E2E-only mock-control hook is dead-code
	// eliminated from the public build. Env vars use bracket access here
	// (noPropertyAccessFromIndexSignature), which Vite does not statically
	// inline — a define does, enabling tree-shaking of the dynamic import.
	define: {
		__ENABLE_MOCK_CONTROL__: JSON.stringify(process.env['VITE_ENABLE_MOCK_CONTROL'] === 'true'),
	},
	base,
} as never)
