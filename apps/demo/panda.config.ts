import { defineConfig } from '@pandacss/dev'
import assert from 'node:assert'

import { animationStyles } from '#theme/animation-styles.ts'
import { blue } from '#theme/colors/blue'
import { green } from '#theme/colors/green.ts'
import { indigo } from '#theme/colors/indigo'
import { olive } from '#theme/colors/olive.ts'
import { orange } from '#theme/colors/orange.ts'
import { purple } from '#theme/colors/purple'
import { red } from '#theme/colors/red.ts'
import { conditions } from '#theme/conditions.ts'
import { globalCss } from '#theme/global-css.ts'
import { keyframes } from '#theme/keyframes.ts'
import { layerStyles } from '#theme/layer-styles.ts'
import { slotRecipes, recipes } from '#theme/recipes'
import { textStyles } from '#theme/text-styles.ts'
import { colors } from '#theme/tokens/colors.ts'
import { durations } from '#theme/tokens/durations.ts'
import { shadows } from '#theme/tokens/shadows.ts'
import { zIndex } from '#theme/tokens/z-index.ts'

const outdir = process.env['PANDA_OUTDIR']
assert(outdir, 'PANDA_OUTDIR env var is not set')

export default defineConfig({
	jsxFramework: 'react',
	// Whether to use css reset
	preflight: true,

	// Where to look for your css declarations
	include: ['./src/**/*.{js,jsx,ts,tsx}'],

	// Files to exclude
	exclude: [],

	// Useful for theme customization
	theme: {
		extend: {
			animationStyles: animationStyles,
			recipes: recipes,
			slotRecipes: slotRecipes,
			keyframes: keyframes,
			layerStyles: layerStyles,
			textStyles: textStyles,

			tokens: {
				colors: colors,
				durations: durations,
				zIndex: zIndex,
			},

			semanticTokens: {
				colors: {
					fg: {
						default: {
							value: {
								_light: '{colors.gray.12}',
								_dark: '{colors.gray.12}',
							},
						},

						muted: {
							value: {
								_light: '{colors.gray.11}',
								_dark: '{colors.gray.11}',
							},
						},

						subtle: {
							value: {
								_light: '{colors.gray.10}',
								_dark: '{colors.gray.10}',
							},
						},
					},

					border: {
						value: {
							_light: '{colors.gray.4}',
							_dark: '{colors.gray.4}',
						},
					},

					error: {
						value: {
							_light: '{colors.red.9}',
							_dark: '{colors.red.9}',
						},
					},

					orange: orange,
					gray: olive,
					red: red,
					green: green,
					blue: blue,
					indigo: indigo,
					purple: purple,
				},

				shadows: shadows,

				radii: {
					l1: {
						value: '{radii.xs}',
					},

					l2: {
						value: '{radii.sm}',
					},

					l3: {
						value: '{radii.md}',
					},
				},
			},
		},
	},

	outdir: outdir,

	globalCss: globalCss,
	conditions: conditions,
	plugins: [
		{
			name: 'Remove Panda Preset Colors',
			hooks: {
				'preset:resolved': ({ utils, preset, name }) =>
					name === '@pandacss/preset-panda'
						? utils.omit(preset, ['theme.tokens.colors', 'theme.semanticTokens.colors'])
						: preset,
			},
		},
	],
})
