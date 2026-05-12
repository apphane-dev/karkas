#!/usr/bin/env bun

import { $ } from 'bun'
import { join } from 'node:path'

const steigerDir = join(import.meta.dir, 'steiger')

await $`bun i`.cwd(steigerDir)
await $`bunx steiger ./../../src`.cwd(steigerDir)
