import type { TimelineEventKind, TimelineEvent } from '#entities/timeline-event'

import {
	AlertTriangle,
	CheckCircle2,
	GitBranch,
	GitPullRequest,
	MessageSquare,
	Rocket,
	type LucideIcon,
} from 'lucide-react'

import { Badge, Text } from '#shared/components'
import { css } from '#styled-system/css'
import { styled } from '#styled-system/jsx'

const kindConfig = {
	deploy: {
		icon: Rocket,
		color: 'green.11',
		bg: 'green.subtle.bg',
		border: 'green.6',
		label: 'Deploy',
	},
	'pr-merged': {
		icon: GitPullRequest,
		color: 'purple.11',
		bg: 'purple.subtle.bg',
		border: 'purple.6',
		label: 'PR Merged',
	},
	comment: {
		icon: MessageSquare,
		color: 'blue.11',
		bg: 'blue.subtle.bg',
		border: 'blue.6',
		label: 'Comment',
	},
	incident: {
		icon: AlertTriangle,
		color: 'red.11',
		bg: 'red.subtle.bg',
		border: 'red.6',
		label: 'Incident',
	},
	release: {
		icon: CheckCircle2,
		color: 'green.11',
		bg: 'green.subtle.bg',
		border: 'green.6',
		label: 'Release',
	},
	branch: {
		icon: GitBranch,
		color: 'orange.11',
		bg: 'orange.subtle.bg',
		border: 'orange.6',
		label: 'Branch',
	},
} satisfies Record<
	TimelineEventKind,
	{ icon: LucideIcon; color: string; bg: string; border: string; label: string }
>

export function TimelineEventCard({ event }: { event: TimelineEvent }) {
	const config = kindConfig[event.kind]
	const Icon = config.icon

	return (
		<styled.div display="flex" gap="4">
			<styled.div display="flex" flexDirection="column" alignItems="center" flexShrink={0}>
				<styled.div
					w="9"
					h="9"
					borderRadius="full"
					bg={config.bg}
					borderWidth="2px"
					borderColor={config.border}
					display="flex"
					alignItems="center"
					justifyContent="center"
					flexShrink={0}
				>
					<Icon className={css({ w: '4', h: '4', color: config.color })} />
				</styled.div>
				<styled.div flex="1" w="2px" bg="gray.4" mt="2" />
			</styled.div>

			<styled.div pb="8" flex="1" minW="0">
				<styled.div display="flex" alignItems="center" flexWrap="wrap" gap="2" mb="1">
					<Badge
						size="sm"
						bg={config.bg}
						color={config.color}
						borderWidth="1px"
						borderColor={config.border}
					>
						{config.label}
					</Badge>
					<styled.span fontSize="xs" color="muted">
						{event.time}
					</styled.span>
					{event.meta && (
						<styled.span
							fontSize="xs"
							color="muted"
							bg="gray.surface.bg.active"
							px="1.5"
							py="0.5"
							borderRadius="sm"
							fontVariantNumeric="tabular-nums"
						>
							{event.meta}
						</styled.span>
					)}
				</styled.div>
				<styled.div fontWeight="medium" fontSize="sm" mb="1">
					{event.title}
				</styled.div>
				<Text fontSize="sm" color="muted" lineHeight="relaxed">
					{event.description}
				</Text>
				<styled.div fontSize="xs" color="muted" mt="2">
					by {event.actor}
				</styled.div>
			</styled.div>
		</styled.div>
	)
}
