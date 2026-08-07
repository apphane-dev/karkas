import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
	...fsd.configs.recommended,
	{
		files: ['../../src/shared/styled-system/**'],
		rules: {
			'fsd/public-api': 'off',
		},
	},
	{
		files: ['../../src/shared/components/**'],
		rules: {
			'fsd/public-api': 'off',
			'fsd/no-reserved-folder-names': 'off',
			'fsd/segments-by-purpose': 'off',
		},
	},
	{
		files: ['../../src/shared/mocks/**'],
		rules: {
			'fsd/public-api': 'off',
		},
	},
	{
		files: ['../../src/app/**'],
		rules: {
			'fsd/no-public-api-sidestep': 'off',
		},
	},
	{
		files: ['../../**/mocks/**', '../../**.test.ts', '../../**.test.tsx'],
		rules: {
			'fsd/forbidden-imports': 'off',
			'fsd/no-public-api-sidestep': 'off',
		},
	},
	{
		files: ['../../**/testing.ts', '../../**/testing.tsx'],
		rules: {
			'fsd/no-public-api-sidestep': 'off',
		},
	},
])
