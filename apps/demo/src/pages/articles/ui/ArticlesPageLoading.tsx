import { m } from '#paraglide/messages.js'
import { MasterDetails } from '#widgets/master-details'

import { ArticleDetailLoadingState } from './detail/ArticleDetailLoadingState'
import { ArticleListLoading } from './list/ArticleListLoading'

type ArticlesPageLoadingProps = {
	showDetail: boolean
}

export function ArticlesPageLoading({ showDetail }: ArticlesPageLoadingProps) {
	return (
		<div role="status" aria-label={m.articles_loading_page()}>
			<div inert>
				<MasterDetails
					isDetailVisible={showDetail}
					masterLabel={m.nav_articles()}
					detailLabel={m.article_detail()}
					master={<ArticleListLoading />}
					detail={<ArticleDetailLoadingState />}
				/>
			</div>
		</div>
	)
}
