import type { Article } from '#entities/article'

import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Plus } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { IconButton } from '#shared/components'
import { styled } from '#styled-system/jsx'
import { ListToolbar } from '#widgets/data-page'

import { searchQueryAtom } from '../../model/search'
import { ArticleListItem } from './ArticleListItem'

type Props = {
	articles: { article: Article; href: string }[]
	selectedId: string | undefined
}

export const ArticleList = reatomComponent(({ articles, selectedId }: Props) => {
	const query = searchQueryAtom().trim().toLowerCase()
	const filtered = query
		? articles.filter(
				({ article }) =>
					article.title.toLowerCase().includes(query) ||
					article.description.toLowerCase().includes(query),
			)
		: articles

	return (
		<>
			<ListToolbar
				placeholder={m.article_search_placeholder()}
				searchValue={searchQueryAtom()}
				onSearchChange={wrap((value: string) => searchQueryAtom.set(value))}
			>
				<IconButton size="sm" variant="outline" aria-label={m.article_new()}>
					<Plus />
				</IconButton>
			</ListToolbar>
			<styled.ul role="list" aria-label={m.nav_articles()}>
				{filtered.map(({ article, href }) => (
					<styled.li key={article.id}>
						<ArticleListItem article={article} href={href} isSelected={selectedId === article.id} />
					</styled.li>
				))}
			</styled.ul>
		</>
	)
}, 'ArticleList')
