export type TimelineEventKind =
	| 'deploy'
	| 'pr-merged'
	| 'comment'
	| 'incident'
	| 'release'
	| 'branch'

export type TimelineEvent = {
	id: string
	kind: TimelineEventKind
	title: string
	description: string
	actor: string
	time: string
	date: string
	meta?: string
}
