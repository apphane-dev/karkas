import type { Article } from '#entities/article/model/types'

import { apiClient } from '#shared/api'

export const ARTICLES_API_PATH = '/articles'

export async function fetchArticles() {
	return apiClient.get<Article[]>(ARTICLES_API_PATH)
}

export async function fetchArticleById(articleId: string) {
	return apiClient.get<Article>(`${ARTICLES_API_PATH}/${articleId}`)
}
