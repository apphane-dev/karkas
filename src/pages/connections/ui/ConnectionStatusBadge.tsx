import type { ConnectionStatus } from '#entities/connection'

import { Badge } from '#shared/components'

const statusConfig = {
	active: { label: 'Active', bg: 'green.subtle.bg', fg: 'green.subtle.fg', border: 'green.6' },
	inactive: { label: 'Inactive', bg: 'gray.subtle.bg', fg: 'gray.subtle.fg', border: 'gray.6' },
	error: { label: 'Error', bg: 'red.subtle.bg', fg: 'red.subtle.fg', border: 'red.6' },
} satisfies Record<ConnectionStatus, { label: string; bg: string; fg: string; border: string }>

type ConnectionStatusBadgeProps = {
	status: ConnectionStatus
}

export function ConnectionStatusBadge({ status }: ConnectionStatusBadgeProps) {
	const config = statusConfig[status]
	return (
		<Badge size="sm" bg={config.bg} color={config.fg} borderWidth="1px" borderColor={config.border}>
			{config.label}
		</Badge>
	)
}
