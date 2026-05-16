import preview from '#.storybook/preview'
import { createActor, heading, text } from '#shared/test'

import { ArticleNotFound } from './ArticleNotFound'

const I = createActor()

const meta = preview.meta({
	title: 'Pages/Articles/ArticleNotFound',
	component: ArticleNotFound,
	parameters: { layout: 'centered' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({
	name: 'Default',
	args: { articleId: 'nonexistent-42' },
})

Default.test('renders not found state with article id', async () => {
	await I.see(heading('Article not found'))
	await I.see(text(/No article exists for id "nonexistent-42"/))
})
