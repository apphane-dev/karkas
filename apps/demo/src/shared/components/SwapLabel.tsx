import type { ReactNode } from 'react'

import { styled } from '#styled-system/jsx'

/**
 * Two alternating labels stacked in one grid cell, so the parent (usually a
 * button) reserves the wider footprint and never resizes when the label swaps.
 * The inactive label keeps its box (visibility: hidden takes it out of the
 * accessibility tree), so exactly one label is announced at a time.
 */
export const SwapLabel = ({
	active,
	on,
	off,
}: {
	/** Which label is visible: `on` when true, `off` when false. */
	active: boolean
	on: ReactNode
	off: ReactNode
}) => (
	<styled.span display="grid" alignItems="center" justifyItems="center">
		<styled.span gridColumn="1" gridRow="1" visibility={active ? 'visible' : 'hidden'}>
			{on}
		</styled.span>
		<styled.span gridColumn="1" gridRow="1" visibility={active ? 'hidden' : 'visible'}>
			{off}
		</styled.span>
	</styled.span>
)
