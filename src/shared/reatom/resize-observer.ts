import { computed, memo, reatomObservable, wrap, type Atom } from '@reatom/core'

export const withResizeObserver = () => {
	return (target: Atom<HTMLElement | null>) => {
		const sizeEntry = computed(() => {
			const stateAtom = memo(() => {
				const node = target()
				if (!node) return null

				return reatomObservable<ResizeObserverEntry | undefined>({
					initState: undefined,
					subscribe: (set) => {
						const observer = new ResizeObserver(
							wrap((entries) => set(entries.find((entry) => entry.target === node))),
						)
						observer.observe(node)
						return () => observer.disconnect()
					},
				})
			})

			return stateAtom?.()
		}, `${target.name}.result`)

		return { sizeEntry }
	}
}
