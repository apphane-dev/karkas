import { inject } from 'codeceptjs'

const { I } = inject()

// Mirrors src/pages/articles/testing.ts (the Storybook page actor) against the
// default MSW handlers. Strings come from messages/en/*.json and
// src/entities/article/mocks/data.ts — keep them source-backed.
const LIST = 'ul[aria-label="Articles"]'
const MAIN = 'main' // <styled.main> in the master-details widget = role "main" (detail column)
const SEARCH = 'input[aria-label="Search articles..."]'

const ARTICLE_TITLES = [
	'Quarterly report',
	'Hiring plan',
	'Roadmap draft',
	'Security audit',
	'Design system update',
]

// Content paragraphs for "Quarterly report" (article id 1).
const QUARTERLY_REPORT_CONTENT = [
	'Regional performance remained strongest',
	'EMEA showed stable retention',
	'APAC growth accelerated',
	'Gross margin improved',
	'next planning cycle should prioritize',
]

export default {
	articleTitles: ARTICLE_TITLES,

	open() {
		I.amOnPage('/articles')
		I.waitForElement(LIST, 10)
	},

	openDirect(articleId: string) {
		I.amOnPage(`/articles/${articleId}`)
	},

	useMobileViewport() {
		// Matches the Storybook `sm` viewport used by the mobile stories.
		I.resizeWindow(390, 844)
	},

	seeNotFound(articleId: string) {
		I.waitForText('Article not found', 10, MAIN)
		I.see(`No article exists for id "${articleId}".`, MAIN)
	},

	goBack() {
		I.click('[aria-label="Back to articles"]')
	},

	seeNoSelection() {
		I.see('No article selected', MAIN)
	},

	seeArticleList() {
		for (const title of ARTICLE_TITLES) I.see(title, LIST)
	},

	seeStatusBadges() {
		I.see('Done', LIST)
		I.see('In Progress', LIST)
		I.see('Draft', LIST)
	},

	seeSearchToolbar() {
		I.seeElement(SEARCH)
		I.seeElement('[aria-label="Filters"]')
		I.seeElement('[aria-label="New article"]')
	},

	seeDescriptionInList(description: string) {
		I.see(description, LIST)
	},

	openArticle(title: string) {
		I.click(title, LIST)
		// Detail loads after the MSW-delayed request; the Edit button is detail-only.
		I.waitForText('Edit', 10, MAIN)
	},

	seeArticleDetail(title: string) {
		// Wait for the detail to load (Edit is detail-only) — covers both the
		// click path and direct-URL navigation, where the request is MSW-delayed.
		I.waitForText('Edit', 10, MAIN)
		I.see(title, MAIN)
	},

	seeQuarterlyReportContent() {
		for (const paragraph of QUARTERLY_REPORT_CONTENT) I.see(paragraph, MAIN)
	},

	seeDetailStatus(status: string) {
		I.see(status, MAIN)
	},

	seeDetailDescription(description: string) {
		I.see(description, MAIN)
	},

	search(term: string) {
		I.fillField(SEARCH, term)
	},

	clearSearch() {
		I.clearField(SEARCH)
	},

	seeInList(title: string) {
		I.see(title, LIST)
	},

	dontSeeInList(title: string) {
		I.dontSee(title, LIST)
	},
}
