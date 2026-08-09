import type { ReactNode } from 'react'

import { styled } from '#styled-system/jsx'

export function MobileHeaderTitle({ label }: { label: ReactNode }) {
	return (
		<styled.span
			flex="1"
			minW="0"
			fontSize="sm"
			fontWeight="semibold"
			color="fg.default"
			letterSpacing="tight"
			lineHeight="short"
			whiteSpace="nowrap"
			overflow="hidden"
			textOverflow="ellipsis"
		>
			{label}
		</styled.span>
	)
}
