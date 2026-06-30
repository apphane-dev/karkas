import { retryComputed, wrap } from '@reatom/core'

import { fetchArticles, fetchArticleById } from '#entities/article'
import { protectedRoute } from '#entities/auth'
import { m } from '#paraglide/messages.js'
import { isApiError } from '#shared/api'
import { PageError } from '#widgets/data-page'
import { MasterDetails } from '#widgets/master-details'

import { ArticlesPageLoading } from '../ui/ArticlesPageLoading'
import { ArticleDetail } from '../ui/detail/ArticleDetail'
import { ArticleDetailLoadingState } from '../ui/detail/ArticleDetailLoadingState'
import { ArticleNoSelection } from '../ui/detail/ArticleNoSelection'
import { ArticleNotFound } from '../ui/detail/ArticleNotFound'
import { ArticleList } from '../ui/list/ArticleList'
import { reatomArticleDetailModel } from './articleDetailModel'

const isArticlesLoading = (isFirstPending: boolean, isPending: boolean, articles: unknown) =>
	isFirstPending || (isPending && !articles)

export const articlesRoute = protectedRoute.reatomRoute(
	{
		path: 'articles',
		layout: true,
		loader: fetchArticles,
		render: (self) => {
			const detail = self.outlet().at(0)
			const selectedArticleId = articleDetailRoute()?.articleId
			const isDetailVisible = selectedArticleId !== undefined || detail !== undefined
			const { isFirstPending, isPending, data: articles } = self.loader.status()
			if (isArticlesLoading(isFirstPending, isPending, articles)) {
				return <ArticlesPageLoading showDetail={isDetailVisible} />
			}

			if (!articles) {
				return (
					<PageError
						title={m.articles_error_title()}
						description={m.articles_error_description()}
						onRetry={wrap(() => retryComputed(self.loader))}
					/>
				)
			}

			return (
				<MasterDetails
					isDetailVisible={isDetailVisible}
					masterLabel={m.nav_articles()}
					detailLabel={m.article_detail()}
					master={
						<ArticleList
							articles={articles.map((article) => ({
								article,
								href: articleDetailRoute.path({ articleId: article.id }),
							}))}
							selectedId={selectedArticleId}
						/>
					}
					detail={detail ?? <ArticleNoSelection />}
				/>
			)
		},
	},
	'articles',
)

export const articleDetailRoute = articlesRoute.reatomRoute(
	{
		path: ':articleId',
		loader: async ({ articleId }) => reatomArticleDetailModel(await fetchArticleById(articleId)),
		render: (self) => {
			const { isPending, data: model } = self.loader.status()
			const error = self.loader.error()
			if (isPending) return <ArticleDetailLoadingState />
			if (error && !(isApiError(error) && error.status === 404)) {
				return (
					<PageError
						title={m.article_detail_error_title()}
						description={m.article_detail_error_description()}
						onRetry={wrap(() => retryComputed(self.loader))}
					/>
				)
			}
			return model ? (
				<ArticleDetail model={model} />
			) : (
				<ArticleNotFound articleId={self().articleId} />
			)
		},
	},
	'articleDetail',
)
