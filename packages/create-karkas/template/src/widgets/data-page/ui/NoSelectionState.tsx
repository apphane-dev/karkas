import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'

import { Text } from '#shared/components'
import { css } from '#styled-system/css'
import { styled } from '#styled-system/jsx'

type NoSelectionStateProps = {
	icon: LucideIcon
	title: ReactNode
	description: ReactNode
}

export function NoSelectionState({ icon: Icon, title, description }: NoSelectionStateProps) {
	return (
		<styled.div
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			h="100%"
			gap="3"
			p="8"
			textAlign="center"
			color="muted"
		>
			<Icon className={css({ w: '10', h: '10', color: 'gray.subtle.fg' })} />
			<Text fontWeight="medium" fontSize="sm">
				{title}
			</Text>
			<Text fontSize="xs">{description}</Text>
		</styled.div>
	)
}
