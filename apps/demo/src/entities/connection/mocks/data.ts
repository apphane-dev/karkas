import type { Connection } from '#entities/connection/model/types'

export const connectionsMockData = [
	{
		id: '1',
		name: 'Stripe API',
		description: 'Payment processing and subscription management.',
		type: 'api',
		status: 'active',
		details: [
			'Connected to Stripe API v2023-10-16 with restricted API key scoped to payment intents and subscriptions.',
			'Webhook endpoint configured for payment_intent.succeeded, invoice.paid, and customer.subscription events.',
			'Average response latency is 180ms with a 99.9% uptime over the last 90 days.',
			'Rate limit headroom is at 85% of the allocated burst capacity during peak billing cycles.',
		],
	},
	{
		id: '2',
		name: 'Analytics DB',
		description: 'Read replica for reporting and dashboard queries.',
		type: 'database',
		status: 'active',
		details: [
			'PostgreSQL 15 read replica hosted in us-east-1 with connection pooling via PgBouncer.',
			'Replication lag averages under 200ms with automated alerts at the 2-second threshold.',
			'Connection pool is sized at 20 connections with a 30-second idle timeout.',
			'Query performance is monitored with pg_stat_statements and slow query alerts above 500ms.',
		],
	},
	{
		id: '3',
		name: 'Slack Notifications',
		description: 'Webhook for team alerts and deployment notifications.',
		type: 'webhook',
		status: 'inactive',
		details: [
			'Outbound webhook configured for #engineering-alerts and #deploy-status channels.',
			'Currently paused due to channel restructuring - awaiting new channel IDs from the team lead.',
			'Message format uses Block Kit with action buttons for acknowledge and escalate workflows.',
			'Retry policy is set to 3 attempts with exponential backoff at 1s, 5s, and 30s intervals.',
		],
	},
	{
		id: '4',
		name: 'Auth0 SSO',
		description: 'Single sign-on provider for enterprise customers.',
		type: 'api',
		status: 'error',
		details: [
			'SAML 2.0 integration with Auth0 tenant configured for enterprise SSO via identity federation.',
			'Certificate rotation failed on the last scheduled update, causing authentication failures for new sessions.',
			'Existing sessions remain valid for 24 hours due to refresh token grace period.',
			'Remediation requires uploading a new X.509 certificate and updating the IdP metadata URL.',
		],
	},
	{
		id: '5',
		name: 'S3 Data Lake',
		description: 'Object storage for raw event data and backups.',
		type: 'database',
		status: 'active',
		details: [
			'S3 bucket in us-west-2 with server-side encryption (SSE-S3) and versioning enabled.',
			'Lifecycle policy transitions objects to Glacier after 90 days and deletes after 365 days.',
			'Daily ingestion averages 2.3 GB of compressed Parquet files partitioned by date and event type.',
			'Cross-region replication is configured to eu-west-1 for disaster recovery compliance.',
		],
	},
] satisfies Connection[]
