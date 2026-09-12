// In-memory mock collection for MSW handlers. This is intentionally NOT a Reatom
// atom: handlers run outside any Reatom frame (`clearStack()` in src/setup.ts is
// strict), so a reactive store would throw "missing async stack" on read. The
// store is plain JS — create/patch/delete return immediately and `list()` is a
// snapshot read.
//
// Seeds are lazy and re-evaluated on `reset()`: a store takes a `seed` provider
// (not a value), calls it at construction, and deep-clones each item so callers
// never alias the fixture object. `reset()` re-invokes `seed()` — which is how
// demo data cleaned between runs is honored on every reset instead of only at
// first touch. `replace(items)` lets a story seed its own contents after the
// global reset.
//
// Isolation between stories does NOT come from keying state by request origin
// (the referer header): a referer-keyed Map leaks across stories that share an
// origin and grows without bound. Instead every store self-registers on creation
// via `registerMockReset`, and `resetMockStores()` — called from the Storybook
// preview `beforeEach` — returns every store to its seed before each story.
// Ad-hoc mutable mock state that is not a collection (e.g. a "current plan id"
// scalar) registers its own callback with `registerMockReset`.

const resets = new Set<() => void>()

/** Register a reset callback drained by `resetMockStores()`. */
export function registerMockReset(fn: () => void) {
	resets.add(fn)
}

/** Drain the reset registry: every registered store/state returns to its seed. */
export function resetMockStores() {
	for (const reset of resets) reset()
}

export function mocksStore<T extends { id: string }>(key: string, seed: () => Array<T> = () => []) {
	const items = new Map<string, T>()

	const loadSeed = () => {
		items.clear()
		for (const item of seed()) {
			if (items.has(item.id)) throw new Error(`${key}: duplicate seed id ${item.id}`)
			items.set(item.id, structuredClone(item))
		}
	}

	loadSeed()
	registerMockReset(loadSeed)

	return {
		makeCreateActions: <D extends Partial<Omit<T, 'id'>>>(defaults: (seq: number) => D) => {
			type DefaultKeys = keyof D & keyof T
			type RequiredKeys = Omit<T, 'id' | DefaultKeys>
			type OptionalKeys = Partial<Pick<T, DefaultKeys>>
			type CreateParams = RequiredKeys & OptionalKeys
			const create = (params: CreateParams, id: string = crypto.randomUUID()): T => {
				if (items.has(id)) throw new Error(`${key}: item ${id} already exists`)
				const item = { id, ...defaults(items.size + 1), ...params } as unknown as T
				items.set(id, item)
				return item
			}
			return { create }
		},
		patch: (id: string, patch: Partial<T>) => {
			const item = items.get(id)
			if (!item) throw new Error(`${key}: item ${id} does not exist`)
			items.set(id, { ...item, ...patch })
		},
		/** Insert (or replace) one fully-formed item by its id, outside the create-actions defaults. */
		add: (item: T) => {
			items.set(item.id, structuredClone(item))
		},
		delete: (id: string) => items.delete(id),
		has: (id: string) => items.has(id),
		get: (id: string) => items.get(id) ?? null,
		list: () => Array.from(items.values()),
		/** Re-invoke the seed provider, deep-cloning each item back into a clean state. */
		reset: loadSeed,
		/** Set explicit contents (story-level override after the global reset). */
		replace: (next: Array<T>) => {
			items.clear()
			for (const item of next) items.set(item.id, structuredClone(item))
		},
	}
}
