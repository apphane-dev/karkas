import { defineConfig } from "astro/config";

// The landing site is served at the domain root. The demo SPA lives under
// /demo/ and Storybook under /storybook/ in the assembled deployment; those
// are built separately and are intentionally out of scope for this package.
//
// The output directory is set via the `astro build --outDir` CLI flag (an
// absolute path) by the mise build tasks, not here, so the composite CF Pages
// build can place this site at the artifact root.
export default defineConfig({
	site: "https://karkas.apphane.dev",
	base: "/",
	trailingSlash: "ignore",
	markdown: {
		shikiConfig: {
			// Light theme so token colors read on the site's light panels.
			theme: "github-light",
		},
	},
	build: {
		format: "directory",
	},
	server: { allowedHosts: true },
});
