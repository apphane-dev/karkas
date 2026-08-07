import { m } from '#paraglide/messages.js'
import { withMatchHeaderTrail } from '#shared/model'

import { articleDetailRoute, articlesRoute } from './model/routes'

articlesRoute.match.extend(
	withMatchHeaderTrail(1, {
		label: () => m.nav_articles(),
		href: articlesRoute.path(),
		backLabel: () => m.article_back_to_articles(),
	}),
)

articleDetailRoute.match.extend(
	withMatchHeaderTrail(2, {
		label: () => articleDetailRoute.loader.data()?.current()?.title ?? m.article_not_found(),
		isLoading: () => articleDetailRoute.loader.pending() > 0,
	}),
)

export { ArticlesNavItem } from './ui/ArticlesNavItem'
