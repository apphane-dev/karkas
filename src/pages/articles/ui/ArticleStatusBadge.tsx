import type { ArticleStatus } from '#entities/article'

import { Badge } from '#shared/components'

const statusConfig = {
	draft: { label: 'Draft', bg: 'gray.subtle.bg', fg: 'gray.subtle.fg', border: 'gray.6' },
	'in-progress': {
		label: 'In Progress',
		bg: 'orange.subtle.bg',
		fg: 'orange.subtle.fg',
		border: 'orange.6',
	},
	done: { label: 'Done', bg: 'green.subtle.bg', fg: 'green.subtle.fg', border: 'green.6' },
} satisfies Record<ArticleStatus, { label: string; bg: string; fg: string; border: string }>

type ArticleStatusBadgeProps = {
	status: ArticleStatus
}

export function ArticleStatusBadge({ status }: ArticleStatusBadgeProps) {
	const config = statusConfig[status]
	return (
		<Badge size="sm" bg={config.bg} color={config.fg} borderWidth="1px" borderColor={config.border}>
			{config.label}
		</Badge>
	)
}
