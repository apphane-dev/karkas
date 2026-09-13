import type { Article } from '#entities/article/model/types'

import { assert } from '@reatom/core'
import { HttpResponse, http, type HttpResponseResolver } from 'msw'

import { articlesMockData } from '#entities/article/mocks/data'
import { composeApiUrl } from '#shared/api'
import { Error404, mocksStore } from '#shared/mocks'
import { mockDelay, neverResolve, to500, withRetrySuccess } from '#shared/mocks/utils'

import { ARTICLES_API_PATH } from '../api/articlesApi'

const listUrl = composeApiUrl(ARTICLES_API_PATH)
const detailUrl = composeApiUrl(`${ARTICLES_API_PATH}/:articleId`)
const updateUrl = composeApiUrl(`${ARTICLES_API_PATH}/:articleId`)

// Mutable article state for the module's lifetime; the Storybook preview's
// `resetMockStores()` drain re-seeds it before each story (the isolation
// contract — see shared/mocks/store). The store deep-clones seeds, so the
// shared fixture is never mutated.
const articlesStore = mocksStore<Article>('articles', () => articlesMockData)

const cloneArticle = (article: Article) => ({
	...article,
	content: [...article.content],
})

const findArticle = (articles: Article[], articleId: string) => {
	const article = articles.find(({ id }) => id === articleId)
	assert(article, `Article with id ${articleId} not found in mock data`, Error404)
	return article
}

const articleListResolver = (async () => {
	await mockDelay()

	return HttpResponse.json(
		articlesStore.list().map(({ content, ...rest }) => ({ ...rest, content: [content[0]] })),
	)
}) satisfies HttpResponseResolver

const articleDetailResolver = (async ({ params }) => {
	await mockDelay()

	const article = findArticle(articlesStore.list(), String(params['articleId']))

	return HttpResponse.json(cloneArticle(article))
}) satisfies HttpResponseResolver

export const articleList = {
	default: http.get(listUrl, articleListResolver),
	error: http.get(listUrl, () => to500()),
	retrySucceeds: () => http.get(listUrl, withRetrySuccess(articleListResolver)),
	loading: http.get(listUrl, neverResolve),
}

export const articleDetail = {
	default: http.get(detailUrl, articleDetailResolver),
	error: http.get(detailUrl, () => to500()),
	retrySucceeds: () => http.get(detailUrl, withRetrySuccess(articleDetailResolver)),
	loading: http.get(detailUrl, neverResolve),
}

const articleUpdateResolver = (async ({ params, request }) => {
	await mockDelay()

	const articleId = String(params['articleId'])
	const article = findArticle(articlesStore.list(), articleId)
	const body = (await request.json()) as Omit<Article, 'id'>
	articlesStore.patch(articleId, body)

	return HttpResponse.json(cloneArticle({ ...article, ...body }))
}) satisfies HttpResponseResolver

export const articleUpdate = {
	default: http.post(updateUrl, articleUpdateResolver),
	error: http.post(updateUrl, () => to500()),
}

export const articleHandlers = [articleList.default, articleDetail.default, articleUpdate.default]
