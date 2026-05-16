import preview from '#.storybook/preview'
import { createActor, text } from '#shared/test'

import { ArticleStatusBadge } from './ArticleStatusBadge'

const I = createActor()

const meta = preview.meta({
	title: 'Pages/Articles/ArticleStatusBadge',
	component: ArticleStatusBadge,
	parameters: { layout: 'centered' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Draft = meta.story({
	name: 'Draft',
	args: { status: 'draft' },
})

Draft.test('renders draft badge', async () => {
	await I.see(text('Draft'))
})

export const InProgress = meta.story({
	name: 'In Progress',
	args: { status: 'in-progress' },
})

InProgress.test('renders in-progress badge', async () => {
	await I.see(text('In Progress'))
})

export const Done = meta.story({
	name: 'Done',
	args: { status: 'done' },
})

Done.test('renders done badge', async () => {
	await I.see(text('Done'))
})
