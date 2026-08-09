import type { Article } from '#entities/article/model/types'

import { assert } from '@reatom/core'
import { HttpResponse, delay, http, type HttpResponseResolver } from 'msw'

import { articlesMockData } from '#entities/article/mocks/data'
import { composeApiUrl } from '#shared/api'
import { Error404 } from '#shared/mocks'
import { neverResolve, to500, withRetrySuccess } from '#shared/mocks/utils'

import { ARTICLES_API_PATH } from '../api/articlesApi'

const listUrl = composeApiUrl(ARTICLES_API_PATH)
const detailUrl = composeApiUrl(`${ARTICLES_API_PATH}/:articleId`)
const updateUrl = composeApiUrl(`${ARTICLES_API_PATH}/:articleId`)

const articlesByStory = new Map<string, Article[]>()

const stateKey = (request: Request) => request.headers.get('referer') ?? 'default'

const cloneArticle = (article: Article) => ({
	...article,
	content: [...article.content],
})

const storyArticles = (request: Request) => {
	const key = stateKey(request)
	let articles = articlesByStory.get(key)
	if (!articles) {
		articles = articlesMockData.map(cloneArticle)
		articlesByStory.set(key, articles)
	}
	return articles
}

const findArticle = (articles: Article[], articleId: string) => {
	const article = articles.find(({ id }) => id === articleId)
	assert(article, `Article with id ${articleId} not found in mock data`, Error404)
	return article
}

const articleListResolver = (async ({ request }) => {
	await delay()

	return HttpResponse.json(
		storyArticles(request).map(({ content, ...rest }) => ({ ...rest, content: [content[0]] })),
	)
}) satisfies HttpResponseResolver

const articleDetailResolver = (async ({ params, request }) => {
	await delay()

	const article = findArticle(storyArticles(request), String(params['articleId']))

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
	await delay()

	const article = findArticle(storyArticles(request), String(params['articleId']))
	const body = (await request.json()) as Omit<Article, 'id'>
	Object.assign(article, body)

	return HttpResponse.json(cloneArticle(article))
}) satisfies HttpResponseResolver

export const articleUpdate = {
	default: http.post(updateUrl, articleUpdateResolver),
	error: http.post(updateUrl, () => to500()),
}

export const articleHandlers = [articleList.default, articleDetail.default, articleUpdate.default]
