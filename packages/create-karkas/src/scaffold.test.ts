import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterEach, expect, test } from 'vitest'

import { scaffoldProject } from './scaffold'

const temporaryDirectories: string[] = []
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

afterEach(async () => {
	await Promise.all(
		temporaryDirectories.splice(0).map((path) => rm(path, { force: true, recursive: true })),
	)
})

test('copies the template and replaces project metadata', async () => {
	const root = await createTemporaryDirectory()
	const targetDirectory = join(root, 'hello-karkas')
	await scaffoldProject({ targetDirectory, packageName: 'hello-karkas' })

	expect(await readPackageName(targetDirectory)).toBe('hello-karkas')
	expect(await readFile(join(targetDirectory, 'index.html'), 'utf8')).toContain(
		'<title>Hello Karkas</title>',
	)
	expect(await readFile(join(targetDirectory, '.gitignore'), 'utf8')).toContain('node_modules')
	expect(await readFile(join(targetDirectory, '.npmrc'), 'utf8')).toContain('node-linker=hoisted')
})

test('does not replace a non-empty directory without force', async () => {
	const root = await createTemporaryDirectory()
	const targetDirectory = join(root, 'existing-project')
	await mkdir(targetDirectory)
	await writeFile(join(targetDirectory, 'keep.txt'), 'keep me')

	await expect(
		scaffoldProject({ targetDirectory, packageName: 'existing-project' }),
	).rejects.toThrow('Target directory is not empty')
	expect(await readFile(join(targetDirectory, 'keep.txt'), 'utf8')).toBe('keep me')
})

test('replaces a non-empty directory when forced', async () => {
	const root = await createTemporaryDirectory()
	const targetDirectory = join(root, 'existing-project')
	await mkdir(targetDirectory)
	await writeFile(join(targetDirectory, 'remove.txt'), 'remove me')

	await scaffoldProject({ targetDirectory, packageName: 'existing-project', force: true })

	await expect(readFile(join(targetDirectory, 'remove.txt'), 'utf8')).rejects.toThrow()
	expect(await readFile(join(targetDirectory, 'package.json'), 'utf8')).toContain(
		'"name": "existing-project"',
	)
})

test('runs the built CLI without interactive prompts', async () => {
	const root = await createTemporaryDirectory()
	const targetDirectory = join(root, 'cli-project')

	execFileSync(process.execPath, [join(packageRoot, 'dist/cli.js'), targetDirectory, '--no-git'], {
		stdio: 'pipe',
	})

	expect(await readPackageName(targetDirectory)).toBe('cli-project')
})

async function readPackageName(targetDirectory: string): Promise<string> {
	const packageJson: unknown = JSON.parse(
		await readFile(join(targetDirectory, 'package.json'), 'utf8'),
	)
	if (
		typeof packageJson !== 'object' ||
		packageJson === null ||
		!('name' in packageJson) ||
		typeof packageJson.name !== 'string'
	) {
		throw new Error('Generated package metadata is invalid.')
	}
	return packageJson.name
}

async function createTemporaryDirectory(): Promise<string> {
	const path = await mkdtemp(join(tmpdir(), 'create-karkas-'))
	temporaryDirectories.push(path)
	return path
}
