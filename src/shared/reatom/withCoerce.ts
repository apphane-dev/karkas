import { withParams, type EnumAtom, type EnumFormat } from '@reatom/core'

/**
 * Extension that adds `string | undefined` coercion to a `reatomEnum` atom.
 *
 * After applying, `.set()` accepts any string (or undefined) and silently falls
 * back to `fallback` when the value is not a known variant. The `.coerce`
 * method is also exposed for use in `fromSnapshot` when adding persistence.
 *
 * Note: the `Format` type parameter (from `reatomEnum`) only affects generated
 * setter method names (e.g. `setIdle`); it does not change `.enum` keys, which
 * always match the original variant strings.
 *
 * @param fallback - A variant string to use when the incoming value is not recognised.
 *
 * @example
 *   const statusAtom = reatomEnum(['idle', 'loading', 'error'], 'status')
 *     .extend(
 *       withCoerce('idle'),
 *       (target) => target.extend(withLocalStorage({ key: 'status', fromSnapshot: target.coerce })),
 *     )
 *
 *   statusAtom.set('loading') // valid, sets to 'loading'
 *   statusAtom.set('unknown') // invalid, falls back to 'idle'
 *   statusAtom.set(undefined) // missing, falls back to 'idle'
 */
export const withCoerce =
	<Default extends string>(fallback: Default) =>
	<T extends string, Format extends EnumFormat = 'camelCase'>(
		target: EnumAtom<T, Format> & (Default extends T ? unknown : never),
	) => {
		const isVariant = (value: string | undefined): value is T =>
			Boolean(value && value in target.enum)

		const coerce = (value: string | undefined) =>
			isVariant(value) ? value : (fallback as unknown as T)

		return target.extend(withParams(coerce), () => ({ coerce }))
	}
