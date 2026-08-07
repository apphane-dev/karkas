import { type ReactNode } from 'react'

import { Alert } from '#shared/components'
import { styled } from '#styled-system/jsx'

type NotFoundStateProps = {
	title: ReactNode
	description: ReactNode
}

export function NotFoundState({ title, description }: NotFoundStateProps) {
	return (
		<styled.div p="8">
			<Alert.Root role="alert" status="error" variant="surface" borderRadius="xl" p="8">
				<Alert.Content>
					<Alert.Title fontSize="lg">{title}</Alert.Title>
					<Alert.Description>{description}</Alert.Description>
				</Alert.Content>
			</Alert.Root>
		</styled.div>
	)
}
