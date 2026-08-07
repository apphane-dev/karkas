import { spawnSync } from 'node:child_process'
import { chmod, copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const templateDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', 'template')
const renamedTemplateFiles = new Map([
	['_gitignore', '.gitignore'],
	['_npmrc', '.npmrc'],
])

export type ScaffoldOptions = {
	targetDirectory: string
	packageName: string
	force?: boolean
	initializeGit?: boolean
}

export type ScaffoldResult = {
	targetDirectory: string
	packageName: string
	gitInitialized: boolean
}

export function normalizePackageName(input: string): string {
	return input
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^[._-]+|[._-]+$/g, '')
		.slice(0, 214)
}

export function packageNameFromTarget(targetDirectory: string): string {
	return normalizePackageName(basename(resolve(targetDirectory)))
}

export function projectTitle(packageName: string): string {
	return packageName
		.replace(/^@[^/]+\//, '')
		.split(/[-_.]+/)
		.filter(Boolean)
		.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
		.join(' ')
}

export async function isDirectoryEmpty(path: string): Promise<boolean> {
	try {
		return (await readdir(path)).length === 0
	} catch (error) {
		if (isMissingPathError(error)) return true
		throw error
	}
}

export async function scaffoldProject(options: ScaffoldOptions): Promise<ScaffoldResult> {
	const targetDirectory = resolve(options.targetDirectory)
	const packageName = normalizePackageName(options.packageName)
	if (!packageName) throw new Error('Project name must contain a letter or number.')

	if (!(await isDirectoryEmpty(targetDirectory))) {
		if (!options.force) throw new Error(`Target directory is not empty: ${targetDirectory}`)
		await rm(targetDirectory, { recursive: true, force: true })
	}

	await mkdir(targetDirectory, { recursive: true })
	await copyTemplateDirectory(templateDirectory, targetDirectory, {
		'{{project-name}}': packageName,
		'{{project-title}}': projectTitle(packageName),
	})

	const gitInitialized = options.initializeGit ? initializeGitRepository(targetDirectory) : false
	return { targetDirectory, packageName, gitInitialized }
}

async function copyTemplateDirectory(
	sourceDirectory: string,
	targetDirectory: string,
	replacements: Record<string, string>,
): Promise<void> {
	const entries = await readdir(sourceDirectory, { withFileTypes: true })
	await Promise.all(
		entries.map(async (entry) => {
			const sourcePath = join(sourceDirectory, entry.name)
			const targetName = renamedTemplateFiles.get(entry.name) ?? entry.name
			const targetPath = join(targetDirectory, targetName)

			if (entry.isDirectory()) {
				await mkdir(targetPath, { recursive: true })
				await copyTemplateDirectory(sourcePath, targetPath, replacements)
				return
			}

			if (!entry.isFile()) return
			const [contents, sourceStats] = await Promise.all([readFile(sourcePath), stat(sourcePath)])
			if (contents.includes(0)) {
				await copyFile(sourcePath, targetPath)
			} else {
				let text = contents.toString('utf8')
				for (const [token, replacement] of Object.entries(replacements)) {
					text = text.replaceAll(token, replacement)
				}
				await writeFile(targetPath, text)
			}
			await chmod(targetPath, sourceStats.mode)
		}),
	)
}

function initializeGitRepository(targetDirectory: string): boolean {
	const git = spawnSync('git', ['init', '--initial-branch=main'], {
		cwd: targetDirectory,
		stdio: 'ignore',
	})
	if (git.status !== 0) return false

	spawnSync('git', ['add', '.'], { cwd: targetDirectory, stdio: 'ignore' })
	spawnSync('git', ['commit', '-m', 'Initial commit'], {
		cwd: targetDirectory,
		stdio: 'ignore',
	})
	return true
}

function isMissingPathError(error: unknown): error is NodeJS.ErrnoException {
	return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}
