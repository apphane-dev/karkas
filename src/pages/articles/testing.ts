import type { Canvas } from '#shared/test/loc'

import { m } from '#paraglide/messages.js'
import {
	button,
	createActor,
	heading,
	link,
	role,
	text,
	withDetailError,
	withPageError,
	withRetryAndLoading,
} from '#shared/test'

const ARTICLE_LINKS = [
	/Quarterly report/i,
	/Hiring plan/i,
	/Roadmap draft/i,
	/Security audit/i,
	/Design system update/i,
] as const

const editLoc = {
	editButton: button('Edit'),
	saveButton: button('Save'),
	cancelButton: button('Cancel'),
	titleField: role('textbox', 'Title'),
	descriptionField: role('textbox', 'Description'),
	statusSelect: role('combobox', 'Status'),
}

// The search input carries a placeholder but no label/aria-label, so its
// accessible name is empty — target it by placeholder text instead.
const searchLoc = {
	searchInput: (canvas: Canvas) => canvas.getByPlaceholderText(m.article_search_placeholder()),
}

export const articlesActor = createActor()
	.extend(withRetryAndLoading('Loading articles page'))
	.extend(
		withPageError({
			title: 'Could not load articles',
			description: "We couldn't load the article list. Try again in a moment.",
		}),
	)
	.extend(
		withDetailError({
			title: 'Could not load article',
			description: "We couldn't load this article. Try again in a moment.",
		}),
	)
	.extend((I) => ({
		goBack: async () => {
			await I.click((canvas) => canvas.findByLabelText('Back to articles'))
		},
		openArticle: async (name: string | RegExp) => {
			await I.click(link(name))
			await I.waitExit(role('status'))
		},
		seeNoSelection: async () => {
			await I.see(text('No article selected').within(role('main')))
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
		search: async (term: string) => {
			await I.fill(searchLoc.searchInput, term)
		},
		clearSearch: async () => {
			await I.clear(searchLoc.searchInput)
		},
		seeArticleInList: async (name: RegExp | string) => {
			await I.see(link(name))
		},
		dontSeeArticleInList: async (name: RegExp | string) => {
			await I.dontSee(link(name))
		},
		seeArticleDetail: async (title: string) => {
			await I.see(heading(title))
			await I.see(button('Edit'))
		},
		seeArticleDetailContent: async () => {
			await I.scope(role('main'), async () => {
				await I.see(text(/Regional performance remained strongest/))
				await I.see(text(/EMEA showed stable retention/))
				await I.see(text(/APAC growth accelerated/))
				await I.see(text(/Gross margin improved/))
				await I.see(text(/next planning cycle should prioritize/))
			})
		},
		seeArticleDetailDescription: async (value: string | RegExp) => {
			await I.scope(role('main'), async () => {
				await I.see(text(value))
			})
		},
		seeArticleDetailStatus: async (status: string) => {
			await I.scope(role('main'), async () => {
				await I.see(text(status))
			})
		},
		seeArticleNotFound: async (articleId: string) => {
			await I.see(heading('Article not found'))
			await I.see(text(`No article exists for id "${articleId}".`))
		},
		seeArticleDescription: async (pattern: RegExp) => {
			await I.see(text(pattern))
		},
		seeDetailLoading: async (detail: HTMLElement) => {
			await I.see(role('status', 'Loading article detail').within(detail))
			await I.dontSee(heading('Quarterly report').within(detail))
			await I.dontSee(text('Article not found').within(detail))
		},
	}))
	.extend((I) => ({
		openEdit: async () => {
			await I.click(editLoc.editButton)
		},
		cancelEdit: async () => {
			await I.click(editLoc.cancelButton)
		},
		saveArticle: async () => {
			await I.click(editLoc.saveButton)
		},
		seeArticleSavedToast: async () => {
			// The "Saving…" loading toast is transient and the global toaster is
			// shared across stories, so observe it best-effort, then firmly wait
			// for the persistent "Article saved" success toast.
			await I.tryTo(() => I.retryTo(() => I.see(role('status', 'Saving…').within('global')), 5))
			await I.retryTo(() => I.see(role('status', 'Article saved').within('global')), 25)
		},
		seeArticleSaveErrorToast: async () => {
			await I.retryTo(
				() => I.see(text("Couldn't save the article. Try again.").within('global')),
				25,
			)
		},
		seeTitleIs: async (value: string) => {
			await I.retryTo(() => I.seeInField(editLoc.titleField, value), 25)
		},
	}))
