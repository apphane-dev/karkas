import { assert } from '@reatom/core'
import { HttpResponse, delay, http, type HttpResponseResolver } from 'msw'

import { articlesMockData } from '#entities/article/mocks/data'
import { composeApiUrl } from '#shared/api'
import { Error404 } from '#shared/mocks'
import { neverResolve, to500, withRetrySuccess } from '#shared/mocks/utils'

import { ARTICLES_API_PATH } from '../api/articlesApi'

const listUrl = composeApiUrl(ARTICLES_API_PATH)
const detailUrl = composeApiUrl(`${ARTICLES_API_PATH}/:articleId`)

const articleListResolver = (async () => {
	await delay()

	return HttpResponse.json(
		articlesMockData.map(({ content, ...rest }) => ({ ...rest, content: [content[0]] })),
	)
}) satisfies HttpResponseResolver

const articleDetailResolver = (async ({ params }) => {
	await delay()

	const articleId = params['articleId']
	const article = articlesMockData.find(({ id }) => id === articleId)
	assert(article, `Article with id ${articleId} not found in mock data`, Error404)

	return HttpResponse.json(article)
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

export const articleHandlers = [articleList.default, articleDetail.default]
