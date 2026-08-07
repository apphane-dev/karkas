import * as p from '@clack/prompts'
import { readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'

import {
	isDirectoryEmpty,
	normalizePackageName,
	packageNameFromTarget,
	scaffoldProject,
} from './scaffold'

type CliOptions = {
	target?: string
	force: boolean
	git?: boolean
}

const help = `create-karkas [directory] [options]

Options:
  --force     replace a non-empty target directory
  --git       initialize a Git repository
  --no-git    do not initialize Git
  --help      show this help
  --version   show the package version`

async function main() {
	const options = parseArgs(process.argv.slice(2))
	if (process.argv.includes('--help')) {
		console.log(help)
		return
	}
	if (process.argv.includes('--version')) {
		console.log(await readPackageVersion())
		return
	}

	p.intro('Create Karkas')

	const targetInput = options.target ?? (await promptForTarget())
	const targetDirectory = resolve(targetInput)
	const packageName = normalizePackageName(packageNameFromTarget(targetDirectory))
	if (!packageName) throw new Error('Project directory must contain a valid package name.')

	let force = options.force
	if (!(await isDirectoryEmpty(targetDirectory)) && !force) {
		if (!process.stdin.isTTY) {
			throw new Error(
				`Target directory is not empty: ${targetDirectory}. Pass --force to replace it.`,
			)
		}
		force = await promptToReplaceTarget(targetDirectory)
	}

	const initializeGit = options.git ?? (process.stdin.isTTY ? await promptForGit() : false)
	const progress = p.spinner()
	progress.start('Scaffolding project')
	const result = await scaffoldProject({
		targetDirectory,
		packageName,
		force,
		initializeGit,
	})
	progress.stop('Project ready')

	const displayPath = relative(process.cwd(), result.targetDirectory) || '.'
	p.note(`cd ${displayPath}\nnub install\nmise run dev`, 'Next steps')
	if (initializeGit && !result.gitInitialized) {
		p.log.warn('Git is unavailable, so the project was created without a repository.')
	}
	p.outro('Built on the Karkas stack — https://karkas.apphane.dev')
}

function parseArgs(args: string[]): CliOptions {
	const options: CliOptions = { force: false }
	for (const arg of args) {
		if (arg === '--help' || arg === '--version') continue
		if (arg === '--force') {
			options.force = true
			continue
		}
		if (arg === '--git') {
			options.git = true
			continue
		}
		if (arg === '--no-git') {
			options.git = false
			continue
		}
		if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`)
		if (options.target) throw new Error(`Unexpected argument: ${arg}`)
		options.target = arg
	}
	return options
}

async function promptForTarget(): Promise<string> {
	if (!process.stdin.isTTY)
		throw new Error('A target directory is required in non-interactive mode.')
	const answer = await p.text({
		message: 'Where should the project be created?',
		placeholder: 'my-karkas-app',
		defaultValue: 'my-karkas-app',
		validate: (value) => (normalizePackageName(value) ? undefined : 'Enter a valid project name.'),
	})
	if (p.isCancel(answer)) return cancel()
	return answer
}

async function promptToReplaceTarget(targetDirectory: string): Promise<boolean> {
	const answer = await p.confirm({
		message: `${targetDirectory} is not empty. Replace its contents?`,
		initialValue: false,
	})
	if (p.isCancel(answer) || !answer) return cancel()
	return true
}

async function promptForGit(): Promise<boolean> {
	const answer = await p.confirm({ message: 'Initialize a Git repository?', initialValue: true })
	if (p.isCancel(answer)) return cancel()
	return answer
}

function cancel(): never {
	p.cancel('Cancelled')
	process.exit(1)
}

async function readPackageVersion(): Promise<string> {
	const packageJson: unknown = JSON.parse(
		await readFile(new URL('../package.json', import.meta.url), 'utf8'),
	)
	if (!isRecord(packageJson) || typeof packageJson['version'] !== 'string') {
		throw new Error('create-karkas package metadata is invalid.')
	}
	return packageJson['version']
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

main().catch((error: unknown) => {
	p.log.error(error instanceof Error ? error.message : String(error))
	process.exitCode = 1
})
