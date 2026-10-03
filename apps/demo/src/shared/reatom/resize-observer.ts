import { computed, memo, reatomObservable, wrap, type Atom } from '@reatom/core'

export type Size = { width: number; height: number }

export const withResizeObserver = () => {
	return (target: Atom<HTMLElement | null>) => {
		const size = computed<Size | null>(() => {
			const sizeAtom = memo(() => {
				const node = target()
				if (!node) return null

				return reatomObservable<Size>({
					initState: null,
					subscribe: (set) => {
						const observer = new ResizeObserver(
							wrap((entries) => {
								const entry = entries.at(-1)
								if (entry) {
									set({
										width: entry.contentRect.width,
										height: entry.contentRect.height,
									})
								}
							}),
						)
						observer.observe(node)
						return () => observer.disconnect()
					},
				})
			})

			return sizeAtom()
		}, `${target.name}.size`)

		return { size }
	}
}
