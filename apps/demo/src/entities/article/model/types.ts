export type ArticleStatus = 'draft' | 'in-progress' | 'done'

export type Article = {
	id: string
	title: string
	description: string
	status: ArticleStatus
	content: string[]
}
