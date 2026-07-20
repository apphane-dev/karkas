import { defineConfig } from 'astro/config'

// The landing site is served at the domain root. The demo SPA lives under
// /demo/ and Storybook under /storybook/ in the assembled deployment; those
// are built separately and are intentionally out of scope for this package.
export default defineConfig({
	site: 'https://karkas.apphane.dev',
	base: '/',
	trailingSlash: 'ignore',
	build: {
		format: 'directory',
	},
})
