import type { Article } from '#entities/article'

import preview from '#.storybook/preview'
import { createActor, link, text } from '#shared/test'

import { ArticleListItem } from './ArticleListItem'

const I = createActor()

const doneArticle = {
	id: '1',
	title: 'Quarterly report',
	description: 'Revenue overview and growth metrics for Q3 across all regions.',
	status: 'done',
	content: ['First paragraph.'],
} satisfies Article

const inProgressArticle = {
	id: '2',
	title: 'Hiring plan',
	description: 'Engineering headcount proposal for the next two quarters.',
	status: 'in-progress',
	content: ['First paragraph.'],
} satisfies Article

const draftArticle = {
	id: '3',
	title: 'Roadmap draft',
	description: 'Feature priorities and timeline estimates for the next product cycle.',
	status: 'draft',
	content: ['First paragraph.'],
} satisfies Article

const meta = preview.meta({
	title: 'Pages/Articles/ArticleListItem',
	component: ArticleListItem,
	parameters: { layout: 'padded' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Default = meta.story({
	name: 'Default',
	args: {
		article: doneArticle,
		href: '/articles/1',
		isSelected: false,
	},
})

Default.test('renders article title and description', async () => {
	await I.see(link(/Quarterly report/i))
	await I.see(text(/Revenue overview and growth metrics/))
	await I.see(text('Done'))
})

export const Selected = meta.story({
	name: 'Selected',
	args: {
		article: doneArticle,
		href: '/articles/1',
		isSelected: true,
	},
})

Selected.test('renders selected item with aria-current', async () => {
	await I.see(link(/Quarterly report/i).options({ current: 'page' }))
})

export const InProgressStatus = meta.story({
	name: 'In Progress Status',
	args: {
		article: inProgressArticle,
		href: '/articles/2',
		isSelected: false,
	},
})

InProgressStatus.test('renders in-progress status badge', async () => {
	await I.see(link(/Hiring plan/i))
	await I.see(text('In Progress'))
})

export const DraftStatus = meta.story({
	name: 'Draft Status',
	args: {
		article: draftArticle,
		href: '/articles/3',
		isSelected: false,
	},
})

DraftStatus.test('renders draft status badge', async () => {
	await I.see(link(/Roadmap draft/i))
	await I.see(text('Draft'))
})
