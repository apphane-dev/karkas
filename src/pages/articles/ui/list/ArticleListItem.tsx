import type { Article } from '#entities/article'

import { styled } from '#styled-system/jsx'

import { ArticleStatusBadge } from '../ArticleStatusBadge'

export function ArticleListItem({
	article,
	href,
	isSelected,
}: {
	article: Article
	href: string
	isSelected: boolean
}) {
	return (
		<styled.a
			href={href}
			display="block"
			w="100%"
			textAlign="left"
			px="4"
			py="3"
			cursor="pointer"
			textDecoration="none"
			color="inherit"
			bg={isSelected ? 'colorPalette.surface.bg.active' : 'transparent'}
			_hover={{ bg: 'colorPalette.surface.bg.active' }}
			borderBottomWidth="1px"
			borderColor="border"
			aria-current={isSelected ? 'page' : undefined}
		>
			<styled.div display="flex" alignItems="center" justifyContent="space-between" gap="2">
				<styled.span fontWeight="medium" fontSize="sm" truncate>
					{article.title}
				</styled.span>
				<ArticleStatusBadge status={article.status} />
			</styled.div>
			<styled.div mt="1">
				<styled.span display="block" fontSize="xs" color="muted" lineClamp={1}>
					{article.description}
				</styled.span>
			</styled.div>
		</styled.a>
	)
}
