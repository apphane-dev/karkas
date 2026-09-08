import { atom } from '@reatom/core'
import { afterEach, expect, test, vi } from 'vite-plus/test'

import { readPersistRecord, withAppWebStorage } from './persist'

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

afterEach(() => {
	vi.unstubAllGlobals()
})

// withAppWebStorage reads globalThis.localStorage when the adapter factory
// runs, so a stub installed before model modules are imported is honored.
// withLocalStorage cannot do this: it captures storage once when @reatom/core
// loads, before any test stub can be installed.
test('a localStorage stub installed before the factory call is honored', () => {
	const localStorage = new MemoryStorage()
	vi.stubGlobal('localStorage', localStorage)

	const adapter = withAppWebStorage('test.persist')
	const persisted = atom('a', 'test.persistedAtom').extend(adapter({ key: 'test.persist' }))
	persisted.set('b')

	expect(localStorage.getItem('test.persist')).toContain('"data":"b"')
})

test('a later atom with the same key restores the persisted state', () => {
	const localStorage = new MemoryStorage()
	vi.stubGlobal('localStorage', localStorage)

	const adapter = withAppWebStorage('test.persist')
	const first = atom('a', 'test.roundtripFirstAtom').extend(adapter({ key: 'test.roundtrip' }))
	first.set('b')

	const second = atom('a', 'test.roundtripSecondAtom').extend(adapter({ key: 'test.roundtrip' }))

	expect(second()).toBe('b')
})

test('absent localStorage falls back to memory and the atom still works', () => {
	vi.stubGlobal('localStorage', undefined)

	const adapter = withAppWebStorage('test.memory')
	const persisted = atom('a', 'test.memoryAtom').extend(adapter({ key: 'test.memory' }))
	persisted.set('b')

	expect(persisted()).toBe('b')
	expect(readPersistRecord('test.memory')).toBeUndefined()
})

test('readPersistRecord returns the payload of a live record', () => {
	const localStorage = new MemoryStorage()
	vi.stubGlobal('localStorage', localStorage)
	localStorage.setItem(
		'test.record',
		JSON.stringify({
			data: 'payload',
			id: 'record-1',
			timestamp: Date.now(),
			to: Date.now() + 60_000,
			version: 0,
		}),
	)

	expect(readPersistRecord<string>('test.record')).toBe('payload')
})

test('readPersistRecord rejects expired, malformed, and missing records', () => {
	const localStorage = new MemoryStorage()
	vi.stubGlobal('localStorage', localStorage)

	localStorage.setItem('test.expired', JSON.stringify({ data: 'old', to: Date.now() - 1 }))
	localStorage.setItem('test.malformed', 'not json')
	localStorage.setItem('test.notRecord', JSON.stringify({ data: 'no expiry' }))

	expect(readPersistRecord('test.expired')).toBeUndefined()
	expect(readPersistRecord('test.malformed')).toBeUndefined()
	expect(readPersistRecord('test.notRecord')).toBeUndefined()
	expect(readPersistRecord('test.missing')).toBeUndefined()
})
