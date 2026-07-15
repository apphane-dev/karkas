// Mirrors the error/loading stories that Storybook drives with per-story
// `msw.handlers` overrides — here via the runtime window.__mockControl hook
// (worker.use), which is exposed only when VITE_ENABLE_MOCK_CONTROL is set.

Feature('Articles list states')

Before(({ I }) => {
	I.loginAsUser()
})

After(({ articlesPage }) => {
	articlesPage.resetMocks()
})

Scenario('shows the page error state when the list request fails', ({ articlesPage }) => {
	articlesPage.forceMock('articleList', 'error')
	articlesPage.openRaw()
	articlesPage.seeListError()
})

Scenario('shows the loading state while the list request is pending', ({ articlesPage }) => {
	articlesPage.forceMock('articleList', 'loading')
	articlesPage.openRaw()
	articlesPage.seeListLoading()
})
