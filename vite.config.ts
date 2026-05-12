import { paraglideVitePlugin } from '@inlang/paraglide-js'
import react from '@vitejs/plugin-react'
import assert from 'node:assert'
import { defineConfig } from 'vite'

const outDir = process.env['WEBAPP_OUT_DIR']
const base = process.env['WEBAPP_BASE_URL']
assert(outDir, 'WEBAPP_OUT_DIR env var is not set')
assert(base, 'WEBAPP_BASE_URL env var is not set')

export default defineConfig(() => ({
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
	].filter(Boolean),
	base,
}))
