import preview from '#.storybook/preview'
import { createActor, role } from '#shared/test'

import { ArticlesPageLoading } from './ArticlesPageLoading'

const I = createActor()

const meta = preview.meta({
	title: 'Pages/Articles/ArticlesPageLoading',
	component: ArticlesPageLoading,
	parameters: { layout: 'fullscreen' },
	loaders: [(ctx) => I.init(ctx)],
})

export default meta

export const WithoutDetail = meta.story({
	name: 'Without Detail',
	args: { showDetail: false },
})

WithoutDetail.test('renders page loading skeleton', async () => {
	await I.see(role('status', 'Loading articles page'))
})

export const WithDetail = meta.story({
	name: 'With Detail',
	args: { showDetail: true },
})

WithDetail.test('renders page loading skeleton with detail panel', async () => {
	await I.see(role('status', 'Loading articles page'))
})

export const WithoutDetailMobile = meta.story({
	name: 'Without Detail (Mobile)',
	args: { showDetail: false },
	globals: { viewport: { value: 'sm', isRotated: false } },
})

WithoutDetailMobile.test('[mobile] renders page loading skeleton', async () => {
	await I.see(role('status', 'Loading articles page'))
})

export const WithDetailMobile = meta.story({
	name: 'With Detail (Mobile)',
	args: { showDetail: true },
	globals: { viewport: { value: 'sm', isRotated: false } },
})

WithDetailMobile.test('[mobile] renders page loading skeleton with detail', async () => {
	await I.see(role('status', 'Loading articles page'))
})
