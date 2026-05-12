import { button, createActor, heading, link, role, text } from '#shared/test'

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

export const connectionsActor = createActor().extend((I) => ({
	seeError: async () => {
		await I.see(heading('Could not load connections'))
		await I.see(role('alert'))
		await I.see(button('Try again'))
	},
	seeLoading: async () => {
		await I.see(role('status', 'Loading connections page'))
		await I.dontSee(role('alert'))
	},
	goBack: async () => {
		await I.click((canvas) => canvas.findByLabelText('Back to connections'))
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
}))
