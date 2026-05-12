import type { ConnectionType } from '#entities/connection'

import { Badge } from '#shared/components'

const typeConfig = {
	api: { label: 'API', bg: 'blue.subtle.bg', fg: 'blue.subtle.fg', border: 'blue.6' },
	database: {
		label: 'Database',
		bg: 'purple.subtle.bg',
		fg: 'purple.subtle.fg',
		border: 'purple.6',
	},
	webhook: {
		label: 'Webhook',
		bg: 'orange.subtle.bg',
		fg: 'orange.subtle.fg',
		border: 'orange.6',
	},
} satisfies Record<ConnectionType, { label: string; bg: string; fg: string; border: string }>

type ConnectionTypeBadgeProps = {
	type: ConnectionType
}

export function ConnectionTypeBadge({ type }: ConnectionTypeBadgeProps) {
	const config = typeConfig[type]
	return (
		<Badge size="sm" bg={config.bg} color={config.fg} borderWidth="1px" borderColor={config.border}>
			{config.label}
		</Badge>
	)
}
