import { m } from '#paraglide/messages.js'
import {
	createActor,
	heading,
	link,
	role,
	text,
	withDetailError,
	withPageError,
	withRetryAndLoading,
} from '#shared/test'

const CONNECTION_LINKS = [
	/Stripe API/i,
	/Analytics DB/i,
	/Slack Notifications/i,
	/Auth0 SSO/i,
	/S3 Data Lake/i,
] as const

export const connectionsLoc = {
	detailLoading: role('status', 'Loading connection detail'),
}

export const connectionsActor = createActor()
	.extend(withRetryAndLoading('Loading connections page'))
	.extend(
		withPageError({
			title: 'Could not load connections',
			description: "We couldn't load the connection list. Try again in a moment.",
		}),
	)
	.extend(
		withDetailError({
			title: 'Could not load connection',
			description: "We couldn't load this connection. Try again in a moment.",
		}),
	)
	.extend((I) => ({
		seeTestConnectionToast: async () => {
			await I.see(role('status', /Testing connection/).within('global'))
			await I.waitExit(role('status', /Testing connection/).within('global'))
			await I.see(role('status', 'Connection successful').within('global'))
		},
		seeReconnectToast: async () => {
			await I.see(role('status', /Reconnecting/).within('global'))
			await I.waitExit(role('status', /Reconnecting/).within('global'))
			await I.see(role('status', 'Reconnected successfully').within('global'))
		},
		goBack: async () => {
			await I.click((canvas) => canvas.findByLabelText('Back to connections'))
		},
		seeConnectionNotFound: async (connectionId: string) => {
			await I.see(heading('Connection not found'))
			await I.see(text(`No connection exists for id "${connectionId}".`))
		},
		seeConnectionList: async () => {
			await I.scope(role('list', 'Connections'), async () => {
				await Promise.all(CONNECTION_LINKS.map((name) => I.see(link(name))))
			})
		},
		seeStatusBadges: async () => {
			await I.see(text('Active').all())
			await I.see(text('Inactive').all())
			await I.see(text('Error').all())
		},
		seeTypeBadges: async () => {
			await I.see(text('API').all())
			await I.see(text('Database').all())
			await I.see(text('Webhook').all())
		},
		// The search input carries a placeholder but no label/aria-label, so its
		// accessible name is empty — target it by placeholder text instead.
		search: async (term: string) => {
			await I.fill((canvas) => canvas.getByPlaceholderText(m.connection_search_placeholder()), term)
		},
		clearSearch: async () => {
			await I.clear((canvas) => canvas.getByPlaceholderText(m.connection_search_placeholder()))
		},
		seeConnectionInList: async (name: string | RegExp) => {
			await I.see(link(name))
		},
		dontSeeConnectionInList: async (name: string | RegExp) => {
			await I.dontSee(link(name))
		},
	}))
