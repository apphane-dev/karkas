import { assert, reatomRoute } from '@reatom/core'
import { createElement, Fragment } from 'react'

assert(import.meta.env['BASE_URL'], 'BASE_URL must be set in the environment variables')
const base = import.meta.env['BASE_URL'].replace(/^\//, '')
const basePath = base ? `/${base}` : ''

export const createAppPath = (path = '') => {
	const normalizedPath = path.replace(/^\//, '')
	if (!basePath) return `/${normalizedPath}`
	return normalizedPath ? `${basePath}/${normalizedPath}` : basePath
}

export const rootRoute = reatomRoute(
	{
		path: base,
		layout: true,
		render: (self) => self.outlet().filter(Boolean).at(-1) ?? createElement(Fragment),
	},
	'rootRoute',
)
