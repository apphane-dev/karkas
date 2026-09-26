import {
	createMemStorage,
	isPersistRecord,
	reatomPersist,
	reatomPersistWebStorage,
} from '@reatom/core'

const memoryFallback = createMemStorage({ name: 'appPersist' })

/**
 * The `localStorage` getter throws `SecurityError` on opaque origins and when
 * the browser blocks site data, so every read goes through this.
 */
function webStorage(): Storage | undefined {
	try {
		return globalThis.localStorage ?? undefined
	} catch {
		return undefined
	}
}

/**
 * Web-storage persist adapter built when the caller's module loads, so a
 * localStorage stub installed before that import is honored — the persistence
 * tests depend on it. `withLocalStorage` cannot do this: it captures storage
 * once when `@reatom/core` loads. Falls back to memory where localStorage is
 * absent or blocked.
 */
export const withAppWebStorage = (name: string) => {
	const storage = webStorage()
	return storage ? reatomPersistWebStorage(name, storage) : reatomPersist(memoryFallback)
}

/** Read a Reatom web-storage record without coupling callers to its shape. */
export function readPersistRecord<T>(key: string): T | undefined {
	const storage = webStorage()
	if (!storage) return undefined
	try {
		const raw = storage.getItem(key)
		if (!raw) return undefined
		const value: unknown = JSON.parse(raw)
		if (!isPersistRecord(value) || value.to < Date.now()) return undefined
		return value.data as T
	} catch {
		return undefined
	}
}
