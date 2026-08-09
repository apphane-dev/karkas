import type { ReactNode } from 'react'

import { Field, Text } from '#shared/components'
import { styled } from '#styled-system/jsx'

type FieldRowProps = {
	label: string
	description?: string
	children: ReactNode
}

export function FieldRow({ label, description, children }: FieldRowProps) {
	return (
		<Field.Root>
			<styled.div
				display="flex"
				flexDirection={{ base: 'column', md: 'row' }}
				gap={{ base: '1', md: '4' }}
				alignItems={{ md: 'center' }}
			>
				<styled.div flex="1" minW="0">
					<Field.Label fontWeight="medium" fontSize="sm">
						{label}
					</Field.Label>
					{description && (
						<Text fontSize="xs" color="muted" mt="0.5">
							{description}
						</Text>
					)}
				</styled.div>
				<styled.div w={{ md: '300px' }} flexShrink={0}>
					{children}
				</styled.div>
			</styled.div>
		</Field.Root>
	)
}
