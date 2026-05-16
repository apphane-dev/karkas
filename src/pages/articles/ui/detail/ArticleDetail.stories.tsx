import type { Article } from '#entities/article'

import preview from '#.storybook/preview'
import { button, createActor, heading, text } from '#shared/test'

import { ArticleDetail } from './ArticleDetail'

const I = createActor()

const doneArticle = {
	id: '1',
	title: 'Quarterly report',
	description: 'Revenue overview and growth metrics for Q3 across all regions.',
	status: 'done',
	content: [
		'Regional performance remained strongest in North America, where subscription renewals outpaced forecast by 6%.',
		'EMEA showed stable retention but slower new-customer acquisition in mid-market accounts due to longer procurement cycles.',
		'APAC growth accelerated in the second half of the quarter after onboarding two strategic channel partners.',
		'Gross margin improved as infrastructure costs declined after database workload rebalancing in production.',
		'The next planning cycle should prioritize conversion optimization in self-serve and pricing tests for annual plans.',
	],
} satisfies Article

const inProgressArticle = {
	id: '2',
	title: 'Hiring plan',
	description: 'Engineering headcount proposal for the next two quarters.',
	status: 'in-progress',
	content: [
		'The proposal focuses on backend platform capacity first, then a second wave for product-facing full-stack teams.',
		'Staffing assumptions are based on current attrition trends and expected onboarding throughput from the recruiting team.',
	],
} satisfies Article

const draftArticle = {
	id: '3',
	title: 'Roadmap draft',
	description: 'Feature priorities and timeline estimates for the next product cycle.',
	status: 'draft',
	content: [
		'The roadmap draft groups work into reliability, onboarding, and collaboration themes to reduce parallel complexity.',
	],
} satisfies Article

const meta = preview.meta({
	title: 'Pages/Articles/ArticleDetail',
	component: ArticleDetail,
	parameters: { layout: 'padded' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const Done = meta.story({
	name: 'Done Article',
	args: { article: doneArticle },
})

Done.test('renders article title and status', async () => {
	await I.see(heading('Quarterly report'))
	await I.see(text('Done'))
})

Done.test('renders article description', async () => {
	await I.see(text('Revenue overview and growth metrics for Q3 across all regions.'))
})

Done.test('renders all content paragraphs', async () => {
	await I.see(text(/Regional performance remained strongest/))
	await I.see(text(/EMEA showed stable retention/))
	await I.see(text(/APAC growth accelerated/))
	await I.see(text(/Gross margin improved/))
	await I.see(text(/next planning cycle should prioritize/))
})

Done.test('shows edit button', async () => {
	await I.see(button('Edit'))
})

export const InProgress = meta.story({
	name: 'In Progress Article',
	args: { article: inProgressArticle },
})

InProgress.test('renders in-progress article with badge', async () => {
	await I.see(heading('Hiring plan'))
	await I.see(text('In Progress'))
	await I.see(text('Engineering headcount proposal for the next two quarters.'))
})

export const Draft = meta.story({
	name: 'Draft Article',
	args: { article: draftArticle },
})

Draft.test('renders draft article with badge', async () => {
	await I.see(heading('Roadmap draft'))
	await I.see(text('Draft'))
})
