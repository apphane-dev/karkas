import type { ElementType, PropsWithChildren } from 'react'

import { styled } from '#styled-system/jsx'

export function VisuallyHidden({ children, as = 'span' }: PropsWithChildren<{ as?: ElementType }>) {
	return (
		<styled.span
			as={as}
			position="absolute"
			w="1px"
			h="1px"
			p="0"
			m="-1px"
			overflow="hidden"
			borderWidth="0"
			clip="rect(0, 0, 0, 0)"
			whiteSpace="nowrap"
		>
			{children}
		</styled.span>
	)
}
