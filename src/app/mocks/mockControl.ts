import type { RequestHandler } from 'msw'
import type { SetupWorker } from 'msw/browser'

import { articleDetail, articleList } from '#entities/article/mocks/handlers'
import { connectionDetail, connectionList } from '#entities/connection/mocks/handlers'
import { dashboardStats } from '#entities/dashboard/mocks/handlers'
import { itemDetail, itemList } from '#entities/item/mocks/handlers'
import { timelineEventList } from '#entities/timeline-event/mocks/handlers'
import { usageStats } from '#entities/usage/mocks/handlers'

export type MockVariant = 'default' | 'error' | 'loading'

// Handler groups that expose default/error/loading variants, keyed by the same
// names Storybook uses in `msw.handlers`. Extend as scenarios need more.
const scenarios = {
	articleList,
	articleDetail,
	connectionList,
	connectionDetail,
	dashboardStats,
	itemList,
	itemDetail,
	timelineEventList,
	usageStats,
} satisfies Record<string, Record<MockVariant, RequestHandler>>

export type MockScenarioName = keyof typeof scenarios

const STORAGE_KEY = '__mockScenario'

type AppliedScenario = { name: MockScenarioName; variant: MockVariant }

function readPersisted(): AppliedScenario[] {
	try {
		return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]') as AppliedScenario[]
	} catch {
		return []
	}
}

function applyScenario(worker: SetupWorker, { name, variant }: AppliedScenario) {
	const group = scenarios[name]
	if (!group) throw new Error(`[mockControl] unknown handler group: ${String(name)}`)
	const handler = group[variant]
	if (!handler) throw new Error(`[mockControl] "${String(name)}" has no "${variant}" variant`)
	worker.use(handler)
}

export interface MockControl {
	use(name: MockScenarioName, variant: MockVariant): void
	reset(): void
}

/**
 * Exposes `window.__mockControl` so E2E tests can force per-endpoint error and
 * loading states at runtime, mirroring Storybook's per-story `msw.handlers`
 * overrides. Applied overrides are persisted in sessionStorage and re-applied on
 * boot (before the app fetches), so they survive the full-page reload that
 * navigation triggers.
 *
 * Gated behind VITE_ENABLE_MOCK_CONTROL — never installed in the public build.
 */
export function installMockControl(worker: SetupWorker) {
	// Re-apply any scenario persisted before a reload, before the app renders.
	for (const applied of readPersisted()) applyScenario(worker, applied)

	const control: MockControl = {
		use(name, variant) {
			applyScenario(worker, { name, variant })
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...readPersisted(), { name, variant }]))
		},
		reset() {
			worker.resetHandlers()
			sessionStorage.removeItem(STORAGE_KEY)
		},
	}
	;(globalThis as typeof globalThis & { __mockControl?: MockControl }).__mockControl = control
}
