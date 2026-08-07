#!/usr/bin/env nub
/// <reference types="node" />

import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const steigerDir = join(dirname(fileURLToPath(import.meta.url)), 'steiger')

async function run(command: string, args: Array<string>, cwd: string): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		const child = spawn(command, args, { cwd, stdio: 'inherit' })
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

await run('nub', ['install', '--frozen-lockfile'], steigerDir)
await run('nub', ['exec', 'steiger', './../../src'], steigerDir)
