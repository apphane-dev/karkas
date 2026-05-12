#!/usr/bin/env bun

/**
 * Verifies that unused ParaglideJS translations are tree-shaken out of the
 * production bundle.
 *
 * The `reatomloc_tree_shake_canary` key exists in messages/en.json and
 * messages/es.json but is never imported in app code. If its translated values
 * appear in the built assets, the bundler failed to eliminate the dead code.
 *
 * Common causes of regression:
 *   - reatomLoc callback passes `m` as argument:  fn(m)  →  fn()
 *   - Dynamic property access: m[`key_${x}`]()  instead of  m.key_x()
 *
 * Run via: mise run lint:paraglide-tree-shaking
 * The task depends on build:webapp so the check always runs against a
 * fresh build.
 */

import { Glob } from 'bun'
import { join } from 'node:path'

const root = join(import.meta.dir, '..')
const distDir = join(root, '.var/dist/webapp/assets')

// Translated values for the `reatomloc_tree_shake_canary` message key.
// The key name makes clear this is not a generic tree-shaking test — it
// specifically guards the reatomLoc pattern against regressions.
const sentinels = [
	'reatomLoc tree-shake canary — must not appear in bundle',
	'reatomLoc árbol canario — no debe aparecer en el bundle',
]

import { existsSync } from 'node:fs'

if (!existsSync(distDir)) {
	console.error(`✗ Build output not found: ${distDir}\n  Run \`mise run build:webapp\` first.`)
	process.exit(1)
}

const files = await Array.fromAsync(new Glob('*.js').scan({ cwd: distDir }))

if (files.length === 0) {
	console.error(`✗ No JS files found in ${distDir}\n  The build output may be empty or corrupted.`)
	process.exit(1)
}

let failed = false

for (const file of files) {
	const content = await Bun.file(join(distDir, file)).text()
	for (const sentinel of sentinels) {
		if (content.includes(sentinel)) {
			console.error(`✗ "${sentinel}" leaked into ${file}`)
			failed = true
		}
	}
}

if (failed) {
	console.error(`
Tree-shaking is broken — unused translations are included in the bundle.

Common causes:
  • reatomLoc callback passes \`m\` as an argument
      before:  reatomLoc((m) => ..., 'name')
      after:   reatomLoc(() => ..., 'name')
  • Dynamic message key access
      before:  m[\`language_\${locale}\`]()
      after:   localeAtom.label(locale)()
`)
	process.exit(1)
}

console.log('✓ Tree-shaking OK — unused translations are not in the bundle.')
