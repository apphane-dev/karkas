import type { Article } from '#entities/article'

import { Plus } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { IconButton } from '#shared/components'
import { styled } from '#styled-system/jsx'
import { ListToolbar } from '#widgets/data-page'

import { ArticleListItem } from './ArticleListItem'

type Props = {
	articles: { article: Article; href: string }[]
	selectedId: string | undefined
}

export function ArticleList({ articles, selectedId }: Props) {
	return (
		<>
			<ListToolbar placeholder={m.article_search_placeholder()}>
				<IconButton size="sm" variant="outline" aria-label={m.article_new()}>
					<Plus />
				</IconButton>
			</ListToolbar>
			<styled.ul role="list" aria-label={m.nav_articles()}>
				{articles.map(({ article, href }) => (
					<styled.li key={article.id}>
						<ArticleListItem article={article} href={href} isSelected={selectedId === article.id} />
					</styled.li>
				))}
			</styled.ul>
		</>
	)
}
