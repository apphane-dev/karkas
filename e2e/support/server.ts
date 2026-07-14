import { type ChildProcess, spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')

const PORT = Number(process.env['E2E_PORT'] ?? 5199)
// Vite's dev server binds to `localhost` (IPv6 ::1 on macOS), so target the same
// hostname rather than 127.0.0.1, which would not be listened on.
const HOST = 'localhost'

/** Base URL the CodeceptJS Playwright helper points at. */
export const E2E_BASE_URL = `http://${HOST}:${PORT}/`

let serverProcess: ChildProcess | null = null

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function isServerUp(): Promise<boolean> {
	try {
		const response = await fetch(E2E_BASE_URL, { redirect: 'manual' })
		// Any HTTP answer (200 or a redirect to /login) means the dev server is serving.
		return response.status > 0
	} catch {
		return false
	}
}

async function waitForServer(timeoutMs: number): Promise<void> {
	const deadline = Date.now() + timeoutMs
	while (Date.now() < deadline) {
		if (await isServerUp()) return
		await sleep(500)
	}
	throw new Error(`App server did not become ready at ${E2E_BASE_URL} within ${timeoutMs}ms`)
}

/**
 * CodeceptJS `bootstrap` hook.
 *
 * Reuses an already-running dev server on E2E_PORT when present (fast local
 * loop: run `mise run dev --port 5199` in another terminal), otherwise starts
 * the Vite dev server with MSW enabled so the mocked API is available.
 */
export async function startAppServer(): Promise<void> {
	if (await isServerUp()) {
		console.log(`[e2e] reusing app server already running at ${E2E_BASE_URL}`)
		return
	}

	console.log(`[e2e] starting app server at ${E2E_BASE_URL} …`)
	serverProcess = spawn('mise', ['run', 'dev', '--port', String(PORT)], {
		cwd: repoRoot,
		detached: true,
		stdio: 'ignore',
		env: {
			...process.env,
			VITE_PORT: String(PORT),
			VITE_ENABLE_MSW: 'true',
			VITE_CONNECT_LOGGER: 'false',
		},
	})
	serverProcess.on('error', (error) => {
		console.error('[e2e] failed to spawn app server:', error)
	})

	await waitForServer(90_000)
	console.log('[e2e] app server ready')
}

/** CodeceptJS `teardown` hook. Stops the server only if this run started it. */
export async function stopAppServer(): Promise<void> {
	if (!serverProcess?.pid) return
	console.log('[e2e] stopping app server')
	try {
		// Negative pid targets the whole detached process group (vite + esbuild children).
		process.kill(-serverProcess.pid, 'SIGTERM')
	} catch {
		// already gone
	}
	serverProcess = null
}
