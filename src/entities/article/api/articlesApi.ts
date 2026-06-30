import type { Article } from '#entities/article/model/types'

import { apiClient } from '#shared/api'

export const ARTICLES_API_PATH = '/articles'

export async function fetchArticles(options?: Pick<RequestInit, 'signal'>) {
	return apiClient.get<Article[]>(ARTICLES_API_PATH, options)
}

export async function fetchArticleById(articleId: string, options?: Pick<RequestInit, 'signal'>) {
	return apiClient.get<Article>(`${ARTICLES_API_PATH}/${articleId}`, options)
}

export async function updateArticle(
	articleId: string,
	values: Omit<Article, 'id'>,
	options?: Pick<RequestInit, 'signal'>,
) {
	return apiClient.post<Article>(`${ARTICLES_API_PATH}/${articleId}`, { ...options, body: values })
}
