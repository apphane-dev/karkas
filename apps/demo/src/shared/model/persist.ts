import {
	createMemStorage,
	isPersistRecord,
	reatomPersist,
	reatomPersistWebStorage,
} from '@reatom/core'

const memoryFallback = createMemStorage({ name: 'appPersist' })

/**
 * Web-storage persist adapter built when the caller's module loads, so a
 * localStorage stub installed before that import is honored — the persistence
 * tests depend on it. `withLocalStorage` cannot do this: it captures storage
 * once when `@reatom/core` loads. Falls back to memory where localStorage is
 * absent, matching `withLocalStorage`.
 */
export const withAppWebStorage = (name: string) =>
	typeof globalThis.localStorage !== 'undefined'
		? reatomPersistWebStorage(name, globalThis.localStorage)
		: reatomPersist(memoryFallback)

/** Read a Reatom web-storage record without coupling callers to its shape. */
export function readPersistRecord<T>(key: string): T | undefined {
	if (typeof localStorage === 'undefined') return undefined
	try {
		const raw = localStorage.getItem(key)
		if (!raw) return undefined
		const value: unknown = JSON.parse(raw)
		if (!isPersistRecord(value) || value.to < Date.now()) return undefined
		return value.data as T
	} catch {
		return undefined
	}
}
