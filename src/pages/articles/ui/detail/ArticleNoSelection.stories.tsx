import preview from '#.storybook/preview'
import { createActor, text } from '#shared/test'

import { ArticleNoSelection } from './ArticleNoSelection'

const I = createActor()

const meta = preview.meta({
	title: 'Pages/Articles/ArticleNoSelection',
	component: ArticleNoSelection,
	parameters: { layout: 'centered' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({ name: 'Default' })

Default.test('renders no-selection state', async () => {
	await I.see(text('No article selected'))
	await I.see(text('Choose an article from the list to view its content.'))
})
