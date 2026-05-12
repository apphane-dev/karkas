import { m } from '#paraglide/messages.js'
import { button, createActor, heading, link, role, text } from '#shared/test'

const ARTICLE_LINKS = [
	/Quarterly report/i,
	/Hiring plan/i,
	/Roadmap draft/i,
	/Security audit/i,
	/Design system update/i,
] as const

export const articlesActor = createActor().extend((I) => ({
	seeError: async () => {
		await I.see(heading('Could not load articles'))
		await I.see(role('alert'))
		await I.see(button('Try again'))
	},
	seeLoading: async () => {
		await I.see(role('status', 'Loading articles page'))
		await I.dontSee(role('alert'))
	},
	goBack: async () => {
		await I.click((canvas) => canvas.findByLabelText('Back to articles'))
	},
	seeArticleList: async () => {
		await I.scope(role('list', 'Articles'), async () => {
			await Promise.all(ARTICLE_LINKS.map((name) => I.see(link(name))))
		})
	},
	seeStatusBadges: async () => {
		await I.see(text('Done').all())
		await I.see(text('In Progress').all())
		await I.see(text('Draft').all())
	},
	seeSearchToolbar: async () => {
		await I.scope(role('navigation', m.nav_articles()), async () => {
			await I.see((canvas) => canvas.getByPlaceholderText(m.article_search_placeholder()))
			await I.see(button('Filters'))
			await I.see(button('New article'))
		})
	},
	seeArticleDetail: async (title: string) => {
		await I.see(heading(title))
		await I.see(button('Edit'))
	},
	seeArticleDescription: async (pattern: RegExp) => {
		await I.see(text(pattern))
	},
	retry: async () => {
		await I.click(button('Try again'))
	},
}))
