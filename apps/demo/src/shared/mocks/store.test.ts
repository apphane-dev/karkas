import { afterEach, expect, test } from 'vite-plus/test'

import { mocksStore, registerMockReset, resetMockStores } from './store'

type Item = { id: string; value: number }

afterEach(() => {
	// The reset registry is module-global; it accumulates across tests. Resetting
	// it via a fresh drain keeps later tests' store counts deterministic.
	resetMockStores()
})

test('seed is loaded at construction', () => {
	const store = mocksStore<Item>('a', () => [{ id: '1', value: 1 }])
	expect(store.list()).toEqual([{ id: '1', value: 1 }])
})

test('seed is re-evaluated on every reset', () => {
	let seeded = 0
	const store = mocksStore<Item>('b', () => [{ id: '1', value: ++seeded }])
	expect(store.get('1')).toEqual({ id: '1', value: 1 })
	store.reset()
	expect(store.get('1')).toEqual({ id: '1', value: 2 })
	store.reset()
	expect(store.get('1')).toEqual({ id: '1', value: 3 })
})

test('reset discards mutations made since the last seed', () => {
	const store = mocksStore<Item>('c', () => [{ id: '1', value: 1 }])
	store.patch('1', { value: 99 })
	store.delete('1')
	expect(store.list()).toEqual([])
	store.reset()
	expect(store.list()).toEqual([{ id: '1', value: 1 }])
})

test('replace overrides contents and is not affected by a subsequent reset of the same provider', () => {
	const store = mocksStore<Item>('d', () => [{ id: '1', value: 1 }])
	store.replace([{ id: '2', value: 2 }])
	expect(store.list()).toEqual([{ id: '2', value: 2 }])
	store.reset()
	expect(store.list()).toEqual([{ id: '1', value: 1 }])
})

test('seeded items are deep-cloned, not aliased to the fixture', () => {
	const fixture = { id: '1', value: 1, nested: { count: 0 } }
	const store = mocksStore<typeof fixture>('e', () => [fixture])
	const got = store.get('1')!
	got.nested.count = 7
	expect(fixture.nested.count).toBe(0)
	store.reset()
	expect(store.get('1')!.nested.count).toBe(0)
})

test('registerMockReset callbacks fire on resetMockStores', () => {
	let calls = 0
	registerMockReset(() => {
		calls++
	})
	resetMockStores()
	expect(calls).toBe(1)
})

test('resetMockStores resets every self-registered store', () => {
	const a = mocksStore<Item>('f', () => [{ id: '1', value: 1 }])
	const b = mocksStore<Item>('g', () => [{ id: '2', value: 2 }])
	a.delete('1')
	b.delete('2')
	resetMockStores()
	expect(a.list()).toEqual([{ id: '1', value: 1 }])
	expect(b.list()).toEqual([{ id: '2', value: 2 }])
})

test('resetMockStores is safe to call repeatedly', () => {
	// The registry retains callbacks for module-level stores; repeated drains must
	// remain harmless as stories reset the shared mock state before each render.
	expect(() => resetMockStores()).not.toThrow()
})
