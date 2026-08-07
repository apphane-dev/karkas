import type { PropsWithChildren, ReactNode } from 'react'

import { Flex } from '#styled-system/jsx'
import { SidebarToggleButton } from '#widgets/app-shell/@x/mobile-header'

const defaultButton = <SidebarToggleButton />

export function MobileHeader({
	children,
	button = defaultButton,
}: PropsWithChildren<{ button?: ReactNode }>) {
	return (
		<Flex w="full" alignItems="center" gap={2}>
			{button}
			{children}
		</Flex>
	)
}
