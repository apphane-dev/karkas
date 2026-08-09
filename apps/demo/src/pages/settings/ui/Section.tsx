import type { ReactNode } from 'react'

import { Fieldset, Heading } from '#shared/components'
import { styled } from '#styled-system/jsx'

type SectionProps = {
	title: string
	children: ReactNode
	footer?: ReactNode
}

export function Section({ title, children, footer }: SectionProps) {
	return (
		<Fieldset.Root flexDirection="column" mb="8">
			<Heading fontSize="lg" mb="4" pb="2" borderBottomWidth="1px" borderColor="border">
				{title}
			</Heading>
			<Fieldset.Content>{children}</Fieldset.Content>
			{footer && <styled.div mt="4">{footer}</styled.div>}
		</Fieldset.Root>
	)
}
