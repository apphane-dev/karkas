import { execFileSync, spawnSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterEach, expect, test } from 'vitest'

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const temporaryDirectories: string[] = []

afterEach(async () => {
	await Promise.all(
		temporaryDirectories.splice(0).map((path) => rm(path, { force: true, recursive: true })),
	)
})

test.each([
	'.config/scripts/fallow-audit.sh',
	'packages/create-karkas/template/.config/scripts/fallow-audit.sh',
])('%s audits the default branch even when the feature upstream equals HEAD', async (script) => {
	const fixture = await createAuditFixture(script)
	fixture.git('update-ref', 'refs/remotes/origin/main', 'HEAD')
	await writeFile(join(fixture.root, 'feature.txt'), 'feature change')
	fixture.commit()
	fixture.git('update-ref', 'refs/remotes/origin/feature', 'HEAD')
	fixture.git('config', 'remote.origin.fetch', '+refs/heads/*:refs/remotes/origin/*')
	fixture.git('config', 'branch.feature.remote', 'origin')
	fixture.git('config', 'branch.feature.merge', 'refs/heads/feature')
	expect(fixture.git('rev-parse', '@{upstream}')).toBe(fixture.git('rev-parse', 'HEAD'))

	const result = fixture.run()
	expect(result.status).toBe(0)
	expect(result.stdout).toContain('\n--base\nrefs/remotes/origin/main\n')
})

test('prefers the configured remote default branch over origin/main', async () => {
	const fixture = await createAuditFixture()
	fixture.git('update-ref', 'refs/remotes/origin/main', 'HEAD')
	fixture.git('update-ref', 'refs/remotes/origin/trunk', 'HEAD')
	fixture.git('symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/trunk')

	const result = fixture.run()
	expect(result.status).toBe(0)
	expect(result.stdout).toContain('\n--base\nrefs/remotes/origin/HEAD\n')
})

test('uses the PR target branch instead of the default branch', async () => {
	const fixture = await createAuditFixture()
	fixture.git('update-ref', 'refs/remotes/origin/main', 'HEAD')
	fixture.git('update-ref', 'refs/remotes/origin/release', 'HEAD')

	const result = fixture.run({ GITHUB_BASE_REF: 'release' })
	expect(result.status).toBe(0)
	expect(result.stdout).toContain('\n--base\nrefs/remotes/origin/release\n')
})

test('respects an explicit base override before the PR target', async () => {
	const fixture = await createAuditFixture()
	fixture.git('update-ref', 'refs/remotes/upstream/main', 'HEAD')

	const result = fixture.run({
		FALLOW_AUDIT_BASE: 'refs/remotes/upstream/main',
		GITHUB_BASE_REF: 'missing',
	})
	expect(result.status).toBe(0)
	expect(result.stdout).toContain('\n--base\nrefs/remotes/upstream/main\n')
})

test('supports a local main branch before the first remote fetch', async () => {
	const fixture = await createAuditFixture()
	fixture.git('branch', 'main')

	const result = fixture.run()
	expect(result.status).toBe(0)
	expect(result.stdout).toContain('\n--base\nrefs/heads/main\n')
})

test.each([{}, { FALLOW_AUDIT_BASE: 'missing' }, { GITHUB_BASE_REF: 'missing' }])(
	'fails explicitly when its selected audit base is unavailable: %j',
	async (environment) => {
		const fixture = await createAuditFixture()
		if (Object.keys(environment).length > 0) {
			fixture.git('update-ref', 'refs/remotes/origin/main', 'HEAD')
		}
		const result = fixture.run(environment)
		expect(result.status).toBe(2)
		expect(result.stdout).toBe('')
		expect(result.stderr).toContain('No usable Fallow audit base')
		expect(result.stderr).toContain('FALLOW_AUDIT_BASE')
	},
)

async function createAuditFixture(script = '.config/scripts/fallow-audit.sh') {
	const root = await mkdtemp(join(tmpdir(), 'karkas-fallow-audit-'))
	temporaryDirectories.push(root)
	const scriptPath = join(root, '.config', 'scripts', 'fallow-audit.sh')
	const bin = join(root, 'bin')
	await mkdir(dirname(scriptPath), { recursive: true })
	await mkdir(bin)
	await copyFile(join(repositoryRoot, script), scriptPath)
	// Capture only the external CLI invocation; base selection uses a real Git repository.
	await writeFile(join(bin, 'nub'), '#!/bin/sh\nprintf \'%s\\n\' "$@"\n', { mode: 0o755 })
	const git = (...args: string[]) =>
		execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' }).trim()
	const commit = () => {
		git('add', '.')
		git(
			'-c',
			'core.hooksPath=/dev/null',
			'-c',
			'user.name=Audit test',
			'-c',
			'user.email=audit@example.invalid',
			'commit',
			'--quiet',
			'-m',
			'Fixture commit',
		)
	}
	git('init', '--quiet', '--initial-branch=feature')
	commit()
	const run = (environment: NodeJS.ProcessEnv = {}) =>
		spawnSync('bash', [scriptPath], {
			cwd: root,
			encoding: 'utf8',
			env: {
				...process.env,
				PATH: `${bin}:${process.env['PATH'] ?? ''}`,
				FALLOW_AUDIT_BASE: '',
				GITHUB_BASE_REF: '',
				...environment,
			},
		})
	return { root, git, commit, run }
}
