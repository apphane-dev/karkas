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
	const handlers: Record<string, (o: CliOptions) => void> = {
		'--help': (o) => {
			o.help = true
		},
		'--version': (o) => {
			o.version = true
		},
		'--force': (o) => {
			o.force = true
		},
		'--git': (o) => {
			o.git = true
		},
		'--no-git': (o) => {
			o.git = false
		},
	}

	for (const arg of args) {
		processArg(arg, options, handlers)
	}
	return options
}

function processArg(
	arg: string,
	options: CliOptions,
	handlers: Record<string, (o: CliOptions) => void>,
) {
	const handler = handlers[arg]
	if (handler) {
		handler(options)
		return
	}
	if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`)
	if (options.target) throw new Error(`Unexpected argument: ${arg}`)
	options.target = arg
}

async function prepareScaffoldContext(options: CliOptions) {
	const targetDirectory = await resolveTargetDirectory(options.target)
	const packageName = getPackageName(targetDirectory)
	const force = await resolveForceMode(targetDirectory, options.force)
	const initializeGit = await resolveGitMode(options.git)

	return { targetDirectory, packageName, force, initializeGit }
}

async function resolveTargetDirectory(target?: string): Promise<string> {
	const targetInput = target ?? (await promptForTarget())
	return resolve(targetInput)
}

function getPackageName(targetDirectory: string): string {
	const packageName = normalizePackageName(packageNameFromTarget(targetDirectory))
	if (!packageName) throw new Error('Project directory must contain a valid package name.')
	return packageName
}

async function resolveForceMode(targetDirectory: string, forceOption: boolean): Promise<boolean> {
	if (forceOption || (await isDirectoryEmpty(targetDirectory))) {
		return forceOption
	}
	if (!process.stdin.isTTY) {
		throw new Error(
			`Target directory is not empty: ${targetDirectory}. Pass --force to replace it.`,
		)
	}
	return await promptToReplaceTarget(targetDirectory)
}

async function resolveGitMode(gitOption?: boolean): Promise<boolean> {
	if (gitOption !== undefined) return gitOption
	return process.stdin.isTTY ? await promptForGit() : false
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
	warnIfGitUnavailable(initializeGit, result.gitInitialized)
	p.outro('Built on the Karkas stack — https://karkas.apphane.dev')
}

function warnIfGitUnavailable(initializeGit: boolean, gitInitialized: boolean) {
	if (initializeGit && !gitInitialized) {
		p.log.warn('Git is unavailable, so the project was created without a repository.')
	}
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
