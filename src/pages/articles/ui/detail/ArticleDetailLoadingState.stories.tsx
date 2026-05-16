import preview from '#.storybook/preview'
import { createActor, role } from '#shared/test'

import { ArticleDetailLoadingState } from './ArticleDetailLoadingState'

const I = createActor()

const meta = preview.meta({
	title: 'Pages/Articles/ArticleDetailLoadingState',
	component: ArticleDetailLoadingState,
	parameters: { layout: 'padded' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({ name: 'Default' })

Default.test('renders loading skeleton with accessible status', async () => {
	await I.see(role('status', 'Loading article detail'))
})
