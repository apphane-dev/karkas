import type { AnyLocator, ArrayLocator, Canvas, DefiniteLocator, FluentLocator } from './loc'
import type { StoryContext } from '@storybook/react-vite'

import { assert } from '@reatom/core'
import { expect, waitFor, within as withinElement } from 'storybook/test'

type MaybePromise<T> = T | Promise<T>

export interface HopeThat {
	(callback: () => MaybePromise<unknown>): Promise<boolean>
	noErrors(): void
}

const toError = (error: unknown) => (error instanceof Error ? error : new Error(String(error)))

const sleep = (ms: number) => new Promise((resolve) => globalThis.setTimeout(resolve, ms))

const isMissingElementError = (error: unknown) =>
	error instanceof Error &&
	error.name === 'TestingLibraryElementError' &&
	error.message.startsWith('Unable to find')

const assertValidMaxTries = (maxTries: number) => {
	assert(Number.isInteger(maxTries) && maxTries > 0, 'retryTo maxTries must be a positive integer')
}

const retryAfterFailure = async <T>(
	error: unknown,
	callback: (tryNumber: number) => MaybePromise<T>,
	maxTries: number,
	pollInterval: number,
	tryNumber: number,
): Promise<T> => {
	if (tryNumber >= maxTries) throw toError(error)
	await sleep(pollInterval)
	return attemptRetry(callback, maxTries, pollInterval, tryNumber + 1)
}

const attemptRetry = async <T>(
	callback: (tryNumber: number) => MaybePromise<T>,
	maxTries: number,
	pollInterval: number,
	tryNumber: number,
): Promise<T> => {
	try {
		return await callback(tryNumber)
	} catch (error) {
		return retryAfterFailure(error, callback, maxTries, pollInterval, tryNumber)
	}
}

// Inspired by codecept.js
function createBase(ctx: () => StoryContext): BaseActor {
	const scopeStack: HTMLElement[] = []
	const softErrors: Error[] = []

	function rootCanvas() {
		return withinElement(ctx().canvasElement.ownerDocument.body)
	}

	function activeCanvas() {
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

	const elementFrom = async (
		locator: DefiniteLocator,
		message = 'Expected locator to resolve to an HTMLElement',
	) => {
		const el = await resolveLocator(locator)
		assert(el instanceof HTMLElement, message)
		return el
	}

	const elementsFrom = async (locator: AnyLocator, options?: { missingAsEmpty?: boolean }) => {
		try {
			const result = await resolveLocator(locator)
			if (Array.isArray(result)) return result
			return result ? [result] : []
		} catch (error) {
			if (options?.missingAsEmpty === true && isMissingElementError(error)) return []
			throw error
		}
	}

	const click = async (locator: DefiniteLocator) => {
		await ctx().userEvent.click(await elementFrom(locator))
	}

	const editInput = async (
		locator: DefiniteLocator,
		expectedValue: string,
		action: (el: HTMLInputElement, userEvent: StoryContext['userEvent']) => Promise<void>,
	) => {
		const { userEvent } = ctx()
		const el = await elementFrom(locator, 'Expected locator to resolve to an HTMLInputElement')
		assert(el instanceof HTMLInputElement, 'Expected locator to resolve to an HTMLInputElement')
		await userEvent.click(el)
		await action(el, userEvent)
		await waitFor(() => expect(el.value).toBe(expectedValue))
		return userEvent
	}

	const scope = async <T>(locator: DefiniteLocator, callback: () => MaybePromise<T>) => {
		const element = await elementFrom(
			locator,
			'Expected scope locator to resolve to an HTMLElement',
		)
		scopeStack.push(element)
		try {
			return await callback()
		} finally {
			scopeStack.pop()
		}
	}

	const retryTo = async <T>(
		callback: (tryNumber: number) => MaybePromise<T>,
		maxTries: number,
		pollInterval = 200,
	) => {
		assertValidMaxTries(maxTries)
		return attemptRetry(callback, maxTries, pollInterval, 1)
	}

	const hopeThat = Object.assign(
		async (callback: () => MaybePromise<unknown>) => {
			try {
				await callback()
				return true
			} catch (error) {
				softErrors.push(toError(error))
				return false
			}
		},
		{
			noErrors: () => {
				if (softErrors.length === 0) return
				const errors = softErrors.splice(0)
				throw new AggregateError(
					errors,
					`${errors.length} soft assertion(s) failed:\n${errors
						.map((error, index) => `${index + 1}) ${error.message}`)
						.join('\n')}`,
				)
			},
		},
	) satisfies HopeThat

	return {
		resolveLocator,
		see: async (locator: AnyLocator) => {
			const [el] = await elementsFrom(locator)
			expect(el).toBeInTheDocument()
			assert(el instanceof HTMLElement, 'Expected locator to resolve to an HTMLElement')
			return el
		},
		dontSee: async (locator: FluentLocator) => {
			expect(await resolveLocator(locator.maybe())).toBeNull()
		},
		waitExit: async (locator: FluentLocator) => {
			await waitFor(async () => void expect(await resolveLocator(locator.maybe())).toBeNull())
		},
		seeInField: async (locator: DefiniteLocator, value: string | number) => {
			expect(await elementFrom(locator)).toHaveValue(value)
		},
		dontSeeInField: async (locator: DefiniteLocator, value: string | number) => {
			expect(await elementFrom(locator)).not.toHaveValue(value)
		},
		seeNumberOfElements: async (locator: AnyLocator, count: number) => {
			expect(await elementsFrom(locator, { missingAsEmpty: count === 0 })).toHaveLength(count)
		},
		grabTextFrom: async (locator: DefiniteLocator) =>
			(await elementFrom(locator)).textContent ?? '',
		grabTextFromAll: async (locator: ArrayLocator) =>
			(await elementsFrom(locator)).map((el) => el.textContent ?? ''),
		grabValueFrom: async (locator: DefiniteLocator) => {
			const el = await elementFrom(locator)
			assert('value' in el, 'Expected locator to resolve to a value-bearing element')
			return String(el.value)
		},
		click,
		fill: async (locator: DefiniteLocator, value: string) => {
			// oxlint-disable-next-line no-shadow
			const userEvent = await editInput(locator, value, async (el, userEvent) => {
				await userEvent.type(el, value, {
					initialSelectionStart: 0,
					initialSelectionEnd: el.value.length,
				})
			})
			await userEvent.tab()
		},
		selectOption: async (locator: DefiniteLocator, value: string | RegExp) => {
			const global = withinElement(ctx().canvasElement.ownerDocument.body)
			await click(locator)
			await click(() => global.getByRole('option', { name: value }))
		},
		clear: async (locator: DefiniteLocator) => {
			await editInput(locator, '', async (el, userEvent) => {
				await userEvent.clear(el)
			})
		},
		press: async (key: string) => {
			await ctx().userEvent.keyboard(key)
		},
		scope,
		within: scope,
		say: async (message: string) => {
			console.info(message)
		},
		tryTo: async (callback: () => MaybePromise<unknown>) => {
			try {
				await callback()
				return true
			} catch {
				return false
			}
		},
		retryTo,
		hopeThat,
	}
}

export interface BaseActor {
	resolveLocator(locator: AnyLocator): Promise<HTMLElement | HTMLElement[] | null>
	see(locator: AnyLocator): Promise<HTMLElement>
	dontSee(locator: FluentLocator): Promise<void>
	waitExit(locator: FluentLocator): Promise<void>
	seeInField(locator: DefiniteLocator, value: string | number): Promise<void>
	dontSeeInField(locator: DefiniteLocator, value: string | number): Promise<void>
	seeNumberOfElements(locator: AnyLocator, count: number): Promise<void>
	grabTextFrom(locator: DefiniteLocator): Promise<string>
	grabTextFromAll(locator: ArrayLocator): Promise<string[]>
	grabValueFrom(locator: DefiniteLocator): Promise<string>
	click(locator: DefiniteLocator): Promise<void>
	fill(locator: DefiniteLocator, value: string): Promise<void>
	selectOption(locator: DefiniteLocator, value: string | RegExp): Promise<void>
	clear(locator: DefiniteLocator): Promise<void>
	press(key: string): Promise<void>
	scope<T>(locator: DefiniteLocator, callback: () => MaybePromise<T>): Promise<T>
	within<T>(locator: DefiniteLocator, callback: () => MaybePromise<T>): Promise<T>
	say(message: string): Promise<void>
	tryTo(callback: () => MaybePromise<unknown>): Promise<boolean>
	retryTo<T>(
		callback: (tryNumber: number) => MaybePromise<T>,
		maxTries: number,
		pollInterval?: number,
	): Promise<T>
	hopeThat: HopeThat
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Actor<T extends {} = {}> = BaseActor &
	T & {
		init(context: StoryContext): void
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		extend<U extends {}>(extension: (current: BaseActor & T) => U): Actor<T & U>
	}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
function makeActor<M extends {}>(methods: BaseActor & M, initFn: (context: StoryContext) => void) {
	return Object.assign({}, methods, {
		init: initFn,
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		extend<U extends {}>(ext: (current: BaseActor & M) => U) {
			const extra = ext(methods)
			return makeActor<M & U>({ ...methods, ...extra }, initFn)
		},
	}) as Actor<M>
}

export const createActor = () => {
	let _ctx: StoryContext | null = null

	function ctx() {
		assert(_ctx !== null, 'I.init(ctx) must be called before using I methods')
		return _ctx
	}

	return makeActor(createBase(ctx), (context) => {
		_ctx = context
	})
}
