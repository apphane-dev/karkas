import {
	context,
	isSomeLoaderPending,
	noop,
	reatomRoute,
	sleep,
	urlAtom,
	withCallHook,
	wrap,
} from '@reatom/core'
import { expect, test } from 'vite-plus/test'

const resetRuntime = () => {
	context.reset()
	urlAtom.routes = {}
	urlAtom.sync.set(() => noop)
	urlAtom.set(new URL('https://example.test/'))
}

const createTrackedRoute = (path: string, name: string, events: string[]) => {
	const route = reatomRoute(
		{
			path,
			async loader() {
				events.push(`run:${name}`)
				await wrap(sleep(1))
				return name
			},
		},
		name,
	)

	route.loader.onReject.extend(
		withCallHook(({ error }) => {
			if (error?.name === 'AbortError') {
				events.push(`reject:${name}:${error.message}`)
			}
		}),
	)

	return route
}

test('urlAtom.go does not touch non-matching route loaders', async () => {
	resetRuntime()
	const events: string[] = []

	createTrackedRoute('a', 'a', events)
	createTrackedRoute('b', 'b', events)

	urlAtom.go('/a')
	await wrap(sleep(5))

	expect(events).toEqual(['run:a'])
})

test('isSomeLoaderPending does not evaluate non-matching route loaders', async () => {
	resetRuntime()
	const events: string[] = []

	createTrackedRoute('a', 'a', events)
	createTrackedRoute('b', 'b', events)

	const unsubscribe = isSomeLoaderPending.subscribe()
	await wrap(sleep(5))
	unsubscribe()

	expect(events).toEqual([])
})
