// Mirrors the mobile stories in src/app/integration/Articles.list.stories.tsx
// (Default (Mobile)) using a real small viewport instead of Storybook viewport
// globals. Kept in its own Feature so the resized window does not leak.

Feature('Articles list (mobile)')

Before(({ I, articlesPage }) => {
	I.loginAsUser()
	articlesPage.useMobileViewport()
	articlesPage.open()
})

Scenario('shows the article list when no article is selected', ({ articlesPage }) => {
	articlesPage.seeArticleList()
	articlesPage.seeStatusBadges()
})

Scenario('shows the search toolbar with a new-article button', ({ articlesPage }) => {
	articlesPage.seeSearchToolbar()
})

Scenario('opens article detail and can navigate back to the list', ({ articlesPage }) => {
	articlesPage.openArticle('Quarterly report')
	articlesPage.seeArticleDetail('Quarterly report')
	articlesPage.seeQuarterlyReportContent()
	articlesPage.goBack()
	articlesPage.seeArticleList()
})
