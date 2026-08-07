/// <reference types="node" />

import { spawn } from 'node:child_process'
import { access, readFile } from 'node:fs/promises'

const PACKAGE_JSON_PATH = 'package.json'
const WORKER_PATH = 'public/mockServiceWorker.js'
const ENSURE_FLAG = '--ensure'

type DependencyMap = Record<string, string>

type PackageJson = {
	dependencies?: DependencyMap
	devDependencies?: DependencyMap
	peerDependencies?: DependencyMap
}

type Semver = {
	major: number
	minor: number
	patch: number
	prerelease: string
}

function getMswVersionRange(pkg: PackageJson): string | null {
	return pkg.devDependencies?.msw ?? pkg.dependencies?.msw ?? pkg.peerDependencies?.msw ?? null
}

function parseSemver(version: string): Semver | null {
	const match = version.match(/^(?:v)?(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?(?:\+[\w.-]+)?$/)
	if (!match) return null

	return {
		major: Number(match[1]),
		minor: Number(match[2]),
		patch: Number(match[3]),
		prerelease: match[4] ?? '',
	}
}

function getPinnedSemver(versionRange: string): string {
	const match = versionRange.match(/\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?/)
	if (!match) {
		throw new Error(`Could not find a pinned semver version in "${versionRange}".`)
	}
	return match[0]
}

function compareSemver(left: string, right: string): number {
	const leftVersion = parseSemver(left)
	const rightVersion = parseSemver(right)
	if (!leftVersion || !rightVersion) {
		throw new Error(`Could not compare semver versions "${left}" and "${right}".`)
	}

	for (const key of ['major', 'minor', 'patch'] as const) {
		const diff = leftVersion[key] - rightVersion[key]
		if (diff !== 0) return Math.sign(diff)
	}

	if (leftVersion.prerelease === rightVersion.prerelease) return 0
	if (!leftVersion.prerelease) return 1
	if (!rightVersion.prerelease) return -1
	return Math.sign(leftVersion.prerelease.localeCompare(rightVersion.prerelease))
}

function satisfiesSupportedRange(version: string, range: string): boolean {
	const pinnedVersion = getPinnedSemver(range)
	const actual = parseSemver(version)
	const pinned = parseSemver(pinnedVersion)
	if (!actual || !pinned) return false

	if (range.trim().startsWith('^')) {
		return actual.major === pinned.major && compareSemver(version, pinnedVersion) >= 0
	}

	if (range.trim().startsWith('~')) {
		return (
			actual.major === pinned.major &&
			actual.minor === pinned.minor &&
			compareSemver(version, pinnedVersion) >= 0
		)
	}

	return compareSemver(version, pinnedVersion) === 0
}

async function fileExists(path: string): Promise<boolean> {
	try {
		await access(path)
		return true
	} catch {
		return false
	}
}

async function readPackageJson(): Promise<PackageJson> {
	if (!(await fileExists(PACKAGE_JSON_PATH))) {
		throw new Error(`Missing ${PACKAGE_JSON_PATH}.`)
	}
	return JSON.parse(await readFile(PACKAGE_JSON_PATH, 'utf8')) as PackageJson
}

async function readWorkerVersion(): Promise<string> {
	if (!(await fileExists(WORKER_PATH))) {
		throw new Error(`Missing ${WORKER_PATH}.`)
	}

	const workerSource = await readFile(WORKER_PATH, 'utf8')
	const match = workerSource.match(/const PACKAGE_VERSION = '([^']+)'/)
	if (!match) {
		throw new Error(`${WORKER_PATH} is missing PACKAGE_VERSION metadata.`)
	}

	return match[1]
}

type VerifyResult =
	| {
			ok: true
			workerVersion: string
			mswVersionRange: string
			pinnedVersion: string
	  }
	| {
			ok: false
			reason: string
			mswVersionRange: string
			pinnedVersion: string
	  }

async function verifyWorkerVersion(): Promise<VerifyResult> {
	const packageJson = await readPackageJson()
	const mswVersionRange = getMswVersionRange(packageJson)
	if (!mswVersionRange) {
		throw new Error('MSW dependency was not found in package.json.')
	}

	const pinnedVersion = getPinnedSemver(mswVersionRange)
	let workerVersion: string

	try {
		workerVersion = await readWorkerVersion()
	} catch (error) {
		const reason = error instanceof Error ? error.message : 'Worker file is missing or invalid.'
		return {
			ok: false,
			reason,
			mswVersionRange,
			pinnedVersion,
		}
	}

	if (!satisfiesSupportedRange(workerVersion, mswVersionRange)) {
		return {
			ok: false,
			reason: `mockServiceWorker.js version ${workerVersion} does not satisfy package.json range "${mswVersionRange}".`,
			mswVersionRange,
			pinnedVersion,
		}
	}

	if (compareSemver(workerVersion, pinnedVersion) !== 0) {
		return {
			ok: false,
			reason: `mockServiceWorker.js is out of date. Expected ${pinnedVersion}, found ${workerVersion}.`,
			mswVersionRange,
			pinnedVersion,
		}
	}

	return {
		ok: true,
		workerVersion,
		mswVersionRange,
		pinnedVersion,
	}
}

async function run(command: string, args: Array<string>): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		const child = spawn(command, args, { stdio: 'inherit' })
		child.on('error', reject)
		child.on('exit', (code, signal) => {
			if (code === 0) {
				resolve()
				return
			}

			reject(
				new Error(
					`${command} ${args.join(' ')} failed${signal ? ` with signal ${signal}` : ` with code ${code}`}.`,
				),
			)
		})
	})
}

async function main() {
	const shouldEnsure = process.argv.includes(ENSURE_FLAG)
	const verified = await verifyWorkerVersion()

	if (!verified.ok) {
		if (!shouldEnsure) {
			throw new Error(`${verified.reason} Run "msw init public --save".`)
		}

		console.log(`${verified.reason}`)
		console.log('Regenerating worker with "msw init public --save"...')
		await run('msw', ['init', 'public', '--save'])
		const postInit = await verifyWorkerVersion()
		if (!postInit.ok) {
			throw new Error(`${postInit.reason} Auto-regeneration failed to align worker version.`)
		}
		console.log(`mockServiceWorker.js is aligned with msw@${postInit.workerVersion}.`)
		return
	}

	console.log(`mockServiceWorker.js is aligned with msw@${verified.workerVersion}.`)
}

await main()
