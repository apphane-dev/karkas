// Mirrors src/app/integration/Articles.list.stories.tsx (Default + Search Articles
// stories) as browser E2E. The mobile and route-fetch-abort stories are
// Storybook-specific and intentionally not mirrored here.

Feature('Articles list')

Before(({ I, articlesPage }) => {
	I.loginAsUser()
	articlesPage.open()
})

Scenario('renders the article list with a no-selection message', ({ articlesPage }) => {
	articlesPage.seeNoSelection()
	articlesPage.seeArticleList()
	articlesPage.seeStatusBadges()
})

Scenario('shows the search toolbar with a new-article button', ({ articlesPage }) => {
	articlesPage.seeSearchToolbar()
})

Scenario('shows article descriptions in list items', ({ articlesPage }) => {
	articlesPage.seeDescriptionInList('Revenue overview and growth metrics')
	articlesPage.seeDescriptionInList('Engineering headcount proposal')
})

Scenario('opens article detail when an article is clicked', ({ articlesPage }) => {
	articlesPage.openArticle('Quarterly report')
	articlesPage.seeArticleDetail('Quarterly report')
})

Scenario('shows all content paragraphs in article detail', ({ articlesPage }) => {
	articlesPage.openArticle('Quarterly report')
	articlesPage.seeArticleDetail('Quarterly report')
	articlesPage.seeQuarterlyReportContent()
})

Scenario('shows the status badge in article detail', ({ articlesPage }) => {
	articlesPage.openArticle('Quarterly report')
	articlesPage.seeDetailStatus('Done')
})

Scenario('shows the article description in the detail view', ({ articlesPage }) => {
	articlesPage.openArticle('Quarterly report')
	articlesPage.seeDetailDescription(
		'Revenue overview and growth metrics for Q3 across all regions.',
	)
})

Scenario('filters the list by title as the query is typed', ({ articlesPage }) => {
	articlesPage.seeArticleList()
	articlesPage.search('security')
	articlesPage.seeInList('Security audit')
	articlesPage.dontSeeInList('Quarterly report')
	articlesPage.dontSeeInList('Hiring plan')
})

Scenario('matches the description too', ({ articlesPage }) => {
	articlesPage.search('headcount')
	articlesPage.seeInList('Hiring plan')
	articlesPage.dontSeeInList('Security audit')
})

Scenario('searches case-insensitively', ({ articlesPage }) => {
	articlesPage.search('ROADMAP')
	articlesPage.seeInList('Roadmap draft')
})

Scenario('restores the full list when the search is cleared', ({ articlesPage }) => {
	articlesPage.search('security')
	articlesPage.dontSeeInList('Quarterly report')
	articlesPage.clearSearch()
	articlesPage.seeInList('Quarterly report')
	articlesPage.seeInList('Security audit')
})

Scenario('shows nothing matching for an unmatched query', ({ articlesPage }) => {
	articlesPage.search('zzzznomatch')
	articlesPage.dontSeeInList('Quarterly report')
	articlesPage.dontSeeInList('Security audit')
})

// Mirrors src/app/integration/Articles.direct-url.stories.tsx — no MSW overrides
// needed: the default detail handler 404s on unknown ids.
Scenario('loads article detail directly from a URL', ({ articlesPage }) => {
	articlesPage.openDirect('1')
	articlesPage.seeArticleDetail('Quarterly report')
	articlesPage.seeQuarterlyReportContent()
})

Scenario('shows the not-found state for a missing article URL', ({ articlesPage }) => {
	articlesPage.openDirect('missing-42')
	articlesPage.seeNotFound('missing-42')
})
