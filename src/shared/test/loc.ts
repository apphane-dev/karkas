import type { StoryContext } from '@storybook/react-vite'
import type { AriaRole } from 'react'

export type Canvas = NonNullable<StoryContext['canvas']>

// All locator functions carry optional metadata for actor diagnostics and scope resolution
type LocatorMeta = { __label?: string; __within?: WithinScope }
type LocatorFn<T> = ((canvas: Canvas) => T | Promise<T>) & LocatorMeta

export type Locator = LocatorFn<HTMLElement | null>
export type DefiniteLocator = LocatorFn<HTMLElement>
export type ArrayLocator = LocatorFn<Array<HTMLElement>>
export type AnyLocator = Locator | DefiniteLocator | ArrayLocator

type WithinScope = HTMLElement | DefiniteLocator | 'global'

type NameOption = string | RegExp

type ByRoleOptions = NonNullable<Parameters<Canvas['getByRole']>[1]>
type ByTextOptions = NonNullable<Parameters<Canvas['getByText']>[1]>

type QueryType = 'role' | 'text'
type QueryMode = 'get' | 'find' | 'query'

type OptsMap = { role: ByRoleOptions; text: ByTextOptions }
type ArgMap = { role: AriaRole | (string & {}); text: NameOption }

// Discriminated union for locator configuration
type LocatorConfigMap = {
	role: {
		type: 'role'
		arg: ArgMap['role']
		initialOptions: OptsMap['role'] | undefined
		options: OptsMap['role'] | undefined
		scope: WithinScope | undefined
		label: string
	}
	text: {
		type: 'text'
		arg: ArgMap['text']
		initialOptions: OptsMap['text'] | undefined
		options: OptsMap['text'] | undefined
		scope: WithinScope | undefined
		label: string
	}
}

type LocatorConfig<T extends QueryType = QueryType> = LocatorConfigMap[T]

// Fluent locator interfaces — Self ensures within/options return the correct variant
interface BaseFluentLocator<T extends QueryType, Self> {
	within(element: WithinScope): Self
	__label?: string
	__within?: WithinScope
	options(opts: OptsMap[T]): Self
}

interface FluentWaitAllLocator<T extends QueryType = QueryType> extends BaseFluentLocator<
	T,
	FluentWaitAllLocator<T>
> {
	(canvas: Canvas): Promise<HTMLElement[]>
}

interface FluentWaitLocator<T extends QueryType = QueryType> extends BaseFluentLocator<
	T,
	FluentWaitLocator<T>
> {
	(canvas: Canvas): Promise<HTMLElement>
	all(): FluentWaitAllLocator<T>
}

interface FluentAllLocator<T extends QueryType = QueryType> extends BaseFluentLocator<
	T,
	FluentAllLocator<T>
> {
	(canvas: Canvas): HTMLElement[]
	wait(): FluentWaitAllLocator<T>
}

interface FluentMaybeLocator<T extends QueryType = QueryType> extends BaseFluentLocator<
	T,
	FluentMaybeLocator<T>
> {
	(canvas: Canvas): HTMLElement | null
	wait(): never
	all(): never
}

export interface FluentLocator<T extends QueryType = QueryType> extends BaseFluentLocator<
	T,
	FluentLocator<T>
> {
	(canvas: Canvas): HTMLElement
	wait(): FluentWaitLocator<T>
	maybe(): FluentMaybeLocator<T>
	all(): FluentAllLocator<T>
}

const mergedOptions = <T extends QueryType>(config: LocatorConfig<T>) =>
	config.options ? { ...config.initialOptions, ...config.options } : config.initialOptions

function invokeRoleSingle(canvas: Canvas, config: LocatorConfig<'role'>, mode: 'get'): HTMLElement
function invokeRoleSingle(
	canvas: Canvas,
	config: LocatorConfig<'role'>,
	mode: 'find',
): Promise<HTMLElement>
function invokeRoleSingle(
	canvas: Canvas,
	config: LocatorConfig<'role'>,
	mode: 'query',
): HTMLElement | null
function invokeRoleSingle(
	canvas: Canvas,
	config: LocatorConfig<'role'>,
	mode: QueryMode,
): HTMLElement | Promise<HTMLElement> | null
function invokeRoleSingle(canvas: Canvas, config: LocatorConfig<'role'>, mode: QueryMode) {
	const opts = mergedOptions(config)
	if (mode === 'get') return canvas.getByRole(config.arg, opts)
	if (mode === 'find') return canvas.findByRole(config.arg, opts)
	return canvas.queryByRole(config.arg, opts)
}

function invokeTextSingle(canvas: Canvas, config: LocatorConfig<'text'>, mode: 'get'): HTMLElement
function invokeTextSingle(
	canvas: Canvas,
	config: LocatorConfig<'text'>,
	mode: 'find',
): Promise<HTMLElement>
function invokeTextSingle(
	canvas: Canvas,
	config: LocatorConfig<'text'>,
	mode: 'query',
): HTMLElement | null
function invokeTextSingle(
	canvas: Canvas,
	config: LocatorConfig<'text'>,
	mode: QueryMode,
): HTMLElement | Promise<HTMLElement> | null
function invokeTextSingle(canvas: Canvas, config: LocatorConfig<'text'>, mode: QueryMode) {
	const opts = mergedOptions(config)
	if (mode === 'get') return canvas.getByText(config.arg, opts)
	if (mode === 'find') return canvas.findByText(config.arg, opts)
	return canvas.queryByText(config.arg, opts)
}

// Type-safe canvas dispatch — single element
function invokeSingle(canvas: Canvas, config: LocatorConfig, mode: 'get'): HTMLElement
function invokeSingle(canvas: Canvas, config: LocatorConfig, mode: 'find'): Promise<HTMLElement>
function invokeSingle(canvas: Canvas, config: LocatorConfig, mode: 'query'): HTMLElement | null
function invokeSingle(canvas: Canvas, config: LocatorConfig, mode: QueryMode) {
	return config.type === 'role'
		? invokeRoleSingle(canvas, config, mode)
		: invokeTextSingle(canvas, config, mode)
}

// Type-safe canvas dispatch — all elements
function invokeAll(canvas: Canvas, config: LocatorConfig, mode: 'get'): HTMLElement[]
function invokeAll(canvas: Canvas, config: LocatorConfig, mode: 'find'): Promise<HTMLElement[]>
function invokeAll(canvas: Canvas, config: LocatorConfig, mode: 'get' | 'find') {
	if (config.type === 'role') {
		const opts = config.options
			? { ...config.initialOptions, ...config.options }
			: config.initialOptions
		if (mode === 'get') return canvas.getAllByRole(config.arg, opts)
		return canvas.findAllByRole(config.arg, opts)
	}
	const opts = config.options
		? { ...config.initialOptions, ...config.options }
		: config.initialOptions
	if (mode === 'get') return canvas.getAllByText(config.arg, opts)
	return canvas.findAllByText(config.arg, opts)
}

function invalidMaybeTransition(action: string) {
	throw new Error(`Cannot call .${action}() after .maybe()`)
}

const formatLabelValue = (value: NameOption) =>
	typeof value === 'string' ? JSON.stringify(value) : String(value)

const formatOptions = (options: object) => {
	const value = JSON.stringify(options, (_key, option) =>
		option instanceof RegExp ? String(option) : option,
	)
	return value.length > 80 ? `${value.slice(0, 77)}...` : value
}

const scopeLabel = (scope: WithinScope) => {
	if (scope === 'global') return 'global'
	if (scope instanceof HTMLElement) return '<element>'
	return scope.__label ?? 'fn()'
}

// Shared base methods for all locator variants
function createBaseMethods<T extends QueryType, Self>(
	config: LocatorConfig<T>,
	rebuild: (nextConfig: LocatorConfig<T>) => Self,
) {
	return {
		__label: config.label,
		__within: config.scope,
		within: (scope: WithinScope): Self =>
			rebuild({ ...config, scope, label: `${config.label} .within(${scopeLabel(scope)})` }),
		options: (opts: OptsMap[T]): Self =>
			rebuild({
				...config,
				options: config.options ? { ...config.options, ...opts } : opts,
				label: `${config.label} .options(${formatOptions(opts)})`,
			}),
	}
}

// Per-variant factory functions — each returns its exact type
function createWaitAllLocator<T extends QueryType>(
	config: LocatorConfig<T>,
): FluentWaitAllLocator<T> {
	return Object.assign(
		(canvas: Canvas) => invokeAll(canvas, config, 'find'),
		createBaseMethods(config, (c) => createWaitAllLocator(c)),
	) as FluentWaitAllLocator<T>
}

function createWaitLocator<T extends QueryType>(config: LocatorConfig<T>): FluentWaitLocator<T> {
	return Object.assign(
		(canvas: Canvas) => invokeSingle(canvas, config, 'find'),
		createBaseMethods(config, (c) => createWaitLocator(c)),
		{ all: () => createWaitAllLocator({ ...config, label: `${config.label} .all()` }) },
	) as FluentWaitLocator<T>
}

function createAllLocator<T extends QueryType>(config: LocatorConfig<T>): FluentAllLocator<T> {
	return Object.assign(
		(canvas: Canvas) => invokeAll(canvas, config, 'get'),
		createBaseMethods(config, (c) => createAllLocator(c)),
		{ wait: () => createWaitAllLocator({ ...config, label: `${config.label} .wait()` }) },
	) as FluentAllLocator<T>
}

function createMaybeLocator<T extends QueryType>(config: LocatorConfig<T>): FluentMaybeLocator<T> {
	return Object.assign(
		(canvas: Canvas) => invokeSingle(canvas, config, 'query'),
		createBaseMethods(config, (c) => createMaybeLocator(c)),
		{
			wait: () => invalidMaybeTransition('wait'),
			all: () => invalidMaybeTransition('all'),
		},
	) as FluentMaybeLocator<T>
}

function createLocator<T extends QueryType>(config: LocatorConfig<T>): FluentLocator<T> {
	return Object.assign(
		(canvas: Canvas) => invokeSingle(canvas, config, 'get'),
		createBaseMethods(config, (c) => createLocator(c)),
		{
			wait: () => createWaitLocator({ ...config, label: `${config.label} .wait()` }),
			maybe: () => createMaybeLocator({ ...config, label: `${config.label} .maybe()` }),
			all: () => createAllLocator({ ...config, label: `${config.label} .all()` }),
		},
	) as FluentLocator<T>
}

export const role = (roleName: AriaRole | (string & {}), name?: NameOption) =>
	createLocator({
		type: 'role',
		arg: roleName,
		initialOptions: name === undefined ? undefined : { name },
		options: undefined,
		scope: undefined,
		label: `${roleName}${name === undefined ? '' : ` ${formatLabelValue(name)}`}`,
	})

export const text = (value: NameOption) =>
	createLocator({
		type: 'text',
		arg: value,
		initialOptions: undefined,
		options: undefined,
		scope: undefined,
		label: `text ${formatLabelValue(value)}`,
	})

export const heading = (name?: NameOption) => role('heading', name)
export const button = (name?: NameOption) => role('button', name)
export const link = (name?: NameOption) => role('link', name)
