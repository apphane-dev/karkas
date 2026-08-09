import { type ReactNode } from 'react'

import { m } from '#paraglide/messages.js'
import { Alert, Button } from '#shared/components'
import { styled } from '#styled-system/jsx'

type PageErrorProps = {
	title: ReactNode
	description: ReactNode
} & ({ onRetry: () => void; retryLabel?: ReactNode } | { onRetry?: never; retryLabel?: never })

export function PageError({ title, description, retryLabel, onRetry }: PageErrorProps) {
	return (
		<styled.div p="8">
			<Alert.Root role="alert" status="error" variant="surface" borderRadius="xl" p="8">
				<Alert.Content>
					<Alert.Title fontSize="lg">{title}</Alert.Title>
					<Alert.Description mb="4">{description}</Alert.Description>
					{onRetry && (
						<Button variant="outline" size="sm" w="fit-content" onClick={onRetry}>
							{retryLabel ?? m.error_retry()}
						</Button>
					)}
				</Alert.Content>
			</Alert.Root>
		</styled.div>
	)
}
