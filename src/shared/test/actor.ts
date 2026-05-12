import { assert } from '@reatom/core'
import type { StoryContext } from '@storybook/react-vite'
import { expect, waitFor, within as withinElement } from 'storybook/test'

import type { AnyLocator, Canvas, DefiniteLocator, FluentLocator } from './loc'

export { assert }

// Inspired by codecept.js
function createBase(ctx: () => StoryContext): BaseActor {
	const scopeStack: HTMLElement[] = []

	function rootCanvas(): Canvas {
		return withinElement(ctx().canvasElement.ownerDocument.body)
	}

	function activeCanvas(): Canvas {
		if (scopeStack.length > 0) {
			return withinElement(scopeStack.at(-1)!)
		}
		return ctx().canvas
	}

	async function resolveScopeLocator(
		scopeLocator: DefiniteLocator,
		resolvingScopes: Set<DefiniteLocator>,
	): Promise<HTMLElement> {
		if (resolvingScopes.has(scopeLocator)) {
			throw new Error('Circular locator scope detected in .within(...)')
		}
		resolvingScopes.add(scopeLocator)
		try {
			const result = await resolveLocator(scopeLocator, resolvingScopes)
			assert(
				result instanceof HTMLElement,
				'Expected .within(locator) to resolve to an HTMLElement',
			)
			return result
		} finally {
			resolvingScopes.delete(scopeLocator)
		}
	}

	async function canvasFor(
		locator: AnyLocator,
		resolvingScopes: Set<DefiniteLocator>,
	): Promise<Canvas> {
		// __within is part of every locator type via LocatorMeta — no cast needed
		const explicitScope = locator.__within
		if (!explicitScope) return activeCanvas()
		if (explicitScope === 'global') return rootCanvas()
		if (explicitScope instanceof HTMLElement) return withinElement(explicitScope)
		return withinElement(await resolveScopeLocator(explicitScope, resolvingScopes))
	}

	async function resolveLocator(
		locator: AnyLocator,
		resolvingScopes: Set<DefiniteLocator> = new Set(),
	): Promise<HTMLElement | HTMLElement[] | null> {
		return await locator(await canvasFor(locator, resolvingScopes))
	}

	const click = async (locator: DefiniteLocator): Promise<void> => {
		const el = await resolveLocator(locator)
		assert(el instanceof HTMLElement, 'Expected locator to resolve to an HTMLElement')
		await ctx().userEvent.click(el)
	}

	const editInput = async (
		locator: DefiniteLocator,
		expectedValue: string,
		action: (el: HTMLInputElement, userEvent: StoryContext['userEvent']) => Promise<void>,
	): Promise<StoryContext['userEvent']> => {
		const { userEvent } = ctx()
		const el = await resolveLocator(locator)
		assert(el instanceof HTMLInputElement, 'Expected locator to resolve to an HTMLInputElement')
		await userEvent.click(el)
		await action(el, userEvent)
		await waitFor(() => expect(el.value).toBe(expectedValue))
		return userEvent
	}

	return {
		resolveLocator,
		see: async (locator: AnyLocator): Promise<HTMLElement> => {
			const result = await resolveLocator(locator)
			const el = Array.isArray(result) ? result[0] : result
			expect(el).toBeInTheDocument()
			assert(el instanceof HTMLElement, 'Expected locator to resolve to an HTMLElement')
			return el
		},
		dontSee: async (locator: FluentLocator): Promise<void> => {
			expect(await resolveLocator(locator.maybe())).toBeNull()
		},
		waitExit: async (locator: FluentLocator): Promise<void> => {
			await waitFor(async () => void expect(await resolveLocator(locator.maybe())).toBeNull())
		},
		seeInField: async (locator: DefiniteLocator, value: string | number): Promise<void> => {
			const el = await resolveLocator(locator)
			assert(el instanceof HTMLElement, 'Expected locator to resolve to an HTMLElement')
			expect(el).toHaveValue(value)
		},
		click,
		fill: async (locator: DefiniteLocator, value: string): Promise<void> => {
			const userEvent = await editInput(locator, value, async (el, userEvent) => {
				await userEvent.type(el, value, {
					initialSelectionStart: 0,
					initialSelectionEnd: el.value.length,
				})
			})
			await userEvent.tab()
		},
		selectOption: async (locator: DefiniteLocator, value: string | RegExp): Promise<void> => {
			const global = withinElement(ctx().canvasElement.ownerDocument.body)
			await click(locator)
			await click(() => global.getByRole('option', { name: value }))
		},
		clear: async (locator: DefiniteLocator): Promise<void> => {
			await editInput(locator, '', async (el, userEvent) => {
				await userEvent.clear(el)
			})
		},
		scope: async (locator: DefiniteLocator, callback: () => Promise<void>): Promise<void> => {
			const element = await resolveLocator(locator)
			assert(element instanceof HTMLElement, 'Expected scope locator to resolve to an HTMLElement')
			scopeStack.push(element)
			try {
				await callback()
			} finally {
				scopeStack.pop()
			}
		},
	}
}

// fallow-ignore-next-line unused-type
export interface BaseActor {
	resolveLocator(locator: AnyLocator): Promise<HTMLElement | HTMLElement[] | null>
	see(locator: AnyLocator): Promise<HTMLElement>
	dontSee(locator: FluentLocator): Promise<void>
	waitExit(locator: FluentLocator): Promise<void>
	seeInField(locator: DefiniteLocator, value: string | number): Promise<void>
	click(locator: DefiniteLocator): Promise<void>
	fill(locator: DefiniteLocator, value: string): Promise<void>
	selectOption(locator: DefiniteLocator, value: string | RegExp): Promise<void>
	clear(locator: DefiniteLocator): Promise<void>
	scope(locator: DefiniteLocator, callback: () => Promise<void>): Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Actor<T extends {} = {}> = BaseActor &
	T & {
		init(context: StoryContext): void
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		extend<U extends {}>(extension: (current: BaseActor & T) => U): Actor<T & U>
	}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
function makeActor<M extends {}>(
	methods: BaseActor & M,
	initFn: (context: StoryContext) => void,
): Actor<M> {
	return Object.assign({}, methods, {
		init: initFn,
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		extend<U extends {}>(ext: (current: BaseActor & M) => U): Actor<M & U> {
			const extra = ext(methods)
			return makeActor<M & U>({ ...methods, ...extra } as BaseActor & M & U, initFn)
		},
	}) as Actor<M>
}

export const createActor = (): Actor => {
	let _ctx: StoryContext | null = null

	function ctx(): StoryContext {
		assert(_ctx !== null, 'I.init(ctx) must be called before using I methods')
		return _ctx
	}

	return makeActor(createBase(ctx), (context) => {
		_ctx = context
	})
}
