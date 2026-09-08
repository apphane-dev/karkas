import type { FeatureToggle } from './featureToggles'

import { afterEach, expect, test, vi } from 'vite-plus/test'

class MemoryStorage implements Storage {
	readonly store = new Map<string, string>()

	get length() {
		return this.store.size
	}

	clear() {
		this.store.clear()
	}

	getItem(key: string) {
		return this.store.get(key) ?? null
	}

	key(index: number) {
		return [...this.store.keys()][index] ?? null
	}

	removeItem(key: string) {
		this.store.delete(key)
	}

	setItem(key: string, value: string) {
		this.store.set(key, value)
	}
}

const seedRecord = (localStorage: MemoryStorage, data: unknown) => {
	localStorage.setItem(
		'karkas-feature-toggles',
		JSON.stringify({
			data,
			id: 'seed',
			timestamp: Date.now(),
			to: Date.now() + 60_000,
			version: 0,
		}),
	)
}

// The model captures localStorage at module load (through withAppWebStorage),
// so the stub must be installed before the dynamic import. resetModules gives
// each test a fresh module with the adapter bound to the current stub.
afterEach(() => {
	vi.unstubAllGlobals()
	vi.resetModules()
})

const loadModel = async () => await import('./featureToggles')

test('persisted names restore, unknown names are coerced away', async () => {
	const localStorage = new MemoryStorage()
	seedRecord(localStorage, ['slow-mocks', 'nonexistent-toggle'])
	vi.stubGlobal('localStorage', localStorage)

	const { featureTogglesAtom } = await loadModel()

	expect(featureTogglesAtom()).toEqual<FeatureToggle[]>(['slow-mocks'])
})

test('setFeature writes a record back to storage', async () => {
	const localStorage = new MemoryStorage()
	vi.stubGlobal('localStorage', localStorage)

	const { featureTogglesAtom } = await loadModel()
	featureTogglesAtom.setFeature('show-beta-badge', true)

	const stored = JSON.parse(localStorage.getItem('karkas-feature-toggles') ?? '{}') as {
		data?: FeatureToggle[]
	}
	expect(stored.data).toEqual<FeatureToggle[]>(['show-beta-badge'])
})

test('setFeature to the current state keeps the record untouched', async () => {
	const localStorage = new MemoryStorage()
	seedRecord(localStorage, ['slow-mocks'])
	vi.stubGlobal('localStorage', localStorage)

	const { featureTogglesAtom } = await loadModel()
	const before = localStorage.getItem('karkas-feature-toggles')
	featureTogglesAtom.setFeature('slow-mocks', true)

	expect(localStorage.getItem('karkas-feature-toggles')).toBe(before)
})

test('toggleFeature flips membership', async () => {
	const localStorage = new MemoryStorage()
	vi.stubGlobal('localStorage', localStorage)

	const { featureTogglesAtom } = await loadModel()
	featureTogglesAtom.toggleFeature('slow-mocks')
	expect(featureTogglesAtom()).toEqual<FeatureToggle[]>(['slow-mocks'])
	featureTogglesAtom.toggleFeature('slow-mocks')
	expect(featureTogglesAtom()).toEqual<FeatureToggle[]>([])
})

test('isEnabled reflects membership', async () => {
	const localStorage = new MemoryStorage()
	vi.stubGlobal('localStorage', localStorage)

	const { featureTogglesAtom } = await loadModel()
	const slowMocks = featureTogglesAtom.isEnabled('slow-mocks')
	expect(slowMocks()).toBe(false)
	featureTogglesAtom.setFeature('slow-mocks', true)
	expect(slowMocks()).toBe(true)
})

test('hand-edited garbage in storage loads as no toggles', async () => {
	const localStorage = new MemoryStorage()
	localStorage.setItem('karkas-feature-toggles', 'not a record')
	vi.stubGlobal('localStorage', localStorage)

	const { featureTogglesAtom, readPersistedFeatureToggles } = await loadModel()

	expect(featureTogglesAtom()).toEqual([])
	expect(readPersistedFeatureToggles()).toEqual([])
})

test('readPersistedFeatureToggles reads storage without the atom', async () => {
	const localStorage = new MemoryStorage()
	seedRecord(localStorage, ['slow-mocks'])
	vi.stubGlobal('localStorage', localStorage)

	const { readPersistedFeatureToggles } = await loadModel()

	expect(readPersistedFeatureToggles()).toEqual<FeatureToggle[]>(['slow-mocks'])
})

test('absent localStorage falls back to memory and the atom still works', async () => {
	vi.stubGlobal('localStorage', undefined)

	const { featureTogglesAtom, readPersistedFeatureToggles } = await loadModel()
	featureTogglesAtom.toggleFeature('slow-mocks')

	expect(featureTogglesAtom()).toEqual<FeatureToggle[]>(['slow-mocks'])
	expect(readPersistedFeatureToggles()).toEqual([])
})
