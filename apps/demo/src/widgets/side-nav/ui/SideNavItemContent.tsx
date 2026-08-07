import type { ComponentType, ReactNode } from 'react'

import { css } from '#styled-system/css'
import { styled } from '#styled-system/jsx'

type Props = {
	Icon: ComponentType<{ className?: string }>
	label: string
	trailing?: ReactNode
}

export function SideNavItemContent({ Icon, label, trailing }: Props) {
	return (
		<styled.span
			display="inline-flex"
			alignItems="center"
			gap="2"
			w="full"
			minW="0"
			className={css({ '[data-sidebar-collapsed] &': { justifyContent: 'center' } })}
		>
			<Icon className={css({ w: '4', h: '4', flexShrink: '0' })} />
			<styled.span
				flex="1"
				minW="0"
				truncate
				className={css({ '[data-sidebar-collapsed] &': { display: 'none' } })}
			>
				{label}
			</styled.span>
			{trailing && (
				<styled.span className={css({ '[data-sidebar-collapsed] &': { display: 'none' } })}>
					{trailing}
				</styled.span>
			)}
		</styled.span>
	)
}
