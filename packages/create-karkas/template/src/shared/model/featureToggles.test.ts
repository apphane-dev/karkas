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
		JSON.stringify({ data, id: 'seed', timestamp: Date.now(), to: Date.now() + 60_000, version: 0 }),
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

test('names absent from the project list are coerced away on load', async () => {
	const localStorage = new MemoryStorage()
	seedRecord(localStorage, ['nonexistent-toggle'])
	vi.stubGlobal('localStorage', localStorage)

	const { featureTogglesAtom } = await loadModel()

	expect(featureTogglesAtom()).toEqual([])
})

test('hand-edited garbage in storage loads as no toggles', async () => {
	const localStorage = new MemoryStorage()
	localStorage.setItem('karkas-feature-toggles', 'not a record')
	vi.stubGlobal('localStorage', localStorage)

	const { featureTogglesAtom, readPersistedFeatureToggles } = await loadModel()

	expect(featureTogglesAtom()).toEqual([])
	expect(readPersistedFeatureToggles()).toEqual([])
})

test('absent localStorage falls back to memory and the atom still works', async () => {
	vi.stubGlobal('localStorage', undefined)

	const { featureTogglesAtom, readPersistedFeatureToggles } = await loadModel()

	expect(featureTogglesAtom()).toEqual([])
	expect(readPersistedFeatureToggles()).toEqual([])
})
