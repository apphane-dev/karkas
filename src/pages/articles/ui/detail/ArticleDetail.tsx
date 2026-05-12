import type { Article } from '#entities/article'

import { m } from '#paraglide/messages.js'
import { Button, Heading, Text } from '#shared/components'
import { styled } from '#styled-system/jsx'

import { ArticleStatusBadge } from '../ArticleStatusBadge'

export function ArticleDetail({ article }: { article: Article }) {
	return (
		<styled.div p="8">
			<styled.div display="flex" alignItems="center" gap="3" mb="6" flexWrap="wrap">
				<Heading as="h1" fontSize="2xl" fontWeight="bold" flex="1">
					{article.title}
				</Heading>
				<ArticleStatusBadge status={article.status} />
				<Button size="sm" variant="outline">
					{m.article_edit()}
				</Button>
			</styled.div>
			<Text color="muted" fontSize="sm" lineHeight="relaxed">
				{article.description}
			</Text>
			<styled.div display="grid" gap="4" mt="6">
				{article.content.map((paragraph, index) => (
					<Text key={index} color="muted" fontSize="sm" lineHeight="relaxed">
						{paragraph}
					</Text>
				))}
			</styled.div>
		</styled.div>
	)
}
