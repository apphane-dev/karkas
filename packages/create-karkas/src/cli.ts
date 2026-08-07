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
	help?: boolean
	version?: boolean
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
	if (options.help) {
		console.log(help)
		return
	}
	if (options.version) {
		console.log(await readPackageVersion())
		return
	}

	p.intro('Create Karkas')

	const context = await prepareScaffoldContext(options)
	const result = await runScaffold(context)

	displayNextSteps(result, context.initializeGit)
}

function parseArgs(args: string[]): CliOptions {
	const options: CliOptions = { force: false }
	for (const arg of args) {
		switch (arg) {
			case '--help':
				options.help = true
				break
			case '--version':
				options.version = true
				break
			case '--force':
				options.force = true
				break
			case '--git':
				options.git = true
				break
			case '--no-git':
				options.git = false
				break
			default:
				if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`)
				if (options.target) throw new Error(`Unexpected argument: ${arg}`)
				options.target = arg
		}
	}
	return options
}

async function prepareScaffoldContext(options: CliOptions) {
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
	return { targetDirectory, packageName, force, initializeGit }
}

async function runScaffold(context: {
	targetDirectory: string
	packageName: string
	force: boolean
	initializeGit: boolean
}) {
	const progress = p.spinner()
	progress.start('Scaffolding project')
	const result = await scaffoldProject(context)
	progress.stop('Project ready')
	return result
}

function displayNextSteps(
	result: { targetDirectory: string; gitInitialized: boolean },
	initializeGit: boolean,
) {
	const relativePath = relative(process.cwd(), result.targetDirectory)
	const displayPath =
		relativePath && !relativePath.startsWith('..') ? relativePath : result.targetDirectory
	p.note(`cd ${displayPath}\nnub install\nmise run dev`, 'Next steps')
	if (initializeGit && !result.gitInitialized) {
		p.log.warn('Git is unavailable, so the project was created without a repository.')
	}
	p.outro('Built on the Karkas stack — https://karkas.apphane.dev')
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
