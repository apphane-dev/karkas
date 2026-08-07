import type { TimelineEvent } from '#entities/timeline-event/model/types'

export const timelineEventsMockData = [
	{
		id: '1',
		kind: 'deploy',
		title: 'Deployed v2.4.1 to production',
		description:
			'All health checks passing. Rollout completed in 47 seconds with zero-downtime swap.',
		actor: 'Alex',
		time: '10:32 AM',
		date: 'Today',
	},
	{
		id: '2',
		kind: 'pr-merged',
		title: 'Merged PR #482 - Auth token refresh',
		description:
			'Adds silent token refresh with 5-minute pre-expiry window. Covers edge case where multiple tabs trigger concurrent refreshes.',
		actor: 'Sam',
		time: '10:14 AM',
		date: 'Today',
		meta: '+312 -89',
	},
	{
		id: '3',
		kind: 'comment',
		title: 'Comment on PR #479 - Search API redesign',
		description:
			'Suggested switching from offset pagination to cursor-based for the autocomplete endpoint to avoid stale results during live indexing.',
		actor: 'Jordan',
		time: '9:45 AM',
		date: 'Today',
	},
	{
		id: '4',
		kind: 'incident',
		title: 'High error rate on /api/connections',
		description:
			'Spike in 503 responses traced to connection pool exhaustion on the read replica. Mitigated by increasing pool size from 20 to 40.',
		actor: 'Morgan',
		time: '8:12 AM',
		date: 'Today',
		meta: 'Resolved',
	},
	{
		id: '5',
		kind: 'release',
		title: 'Released v2.4.0',
		description:
			'Includes new dashboard layout, connection status monitoring, and improved search filters. Full changelog published.',
		actor: 'Alex',
		time: '6:00 PM',
		date: 'Yesterday',
		meta: '14 PRs',
	},
	{
		id: '6',
		kind: 'branch',
		title: 'Created feature/kanban-board',
		description:
			'Branched from main at commit a3f8c21. Tracking issue #94 for drag-and-drop column reordering.',
		actor: 'Casey',
		time: '4:30 PM',
		date: 'Yesterday',
	},
	{
		id: '7',
		kind: 'pr-merged',
		title: 'Merged PR #478 - Badge color tokens',
		description:
			'Migrated all badge components from raw color scale steps to semantic tokens. Improves theme consistency across light and dark modes.',
		actor: 'Jordan',
		time: '2:15 PM',
		date: 'Yesterday',
		meta: '+48 -52',
	},
	{
		id: '8',
		kind: 'deploy',
		title: 'Deployed v2.3.9 to staging',
		description:
			'Pre-release validation deployment. Includes database migration for new activity_logs table with partitioning by month.',
		actor: 'Sam',
		time: '11:00 AM',
		date: 'Yesterday',
	},
	{
		id: '9',
		kind: 'comment',
		title: 'Comment on issue #91 - Dashboard performance',
		description:
			'Profiling shows chart re-renders on every sidebar interaction. Proposed memoization boundary at the widget level.',
		actor: 'Alex',
		time: '9:30 AM',
		date: '2 days ago',
	},
	{
		id: '10',
		kind: 'incident',
		title: 'SSL certificate near expiry on CDN',
		description:
			'Auto-renewal failed due to DNS propagation delay. Manually triggered renewal and verified across all edge locations.',
		actor: 'Morgan',
		time: '7:45 AM',
		date: '2 days ago',
		meta: 'Resolved',
	},
] satisfies TimelineEvent[]
