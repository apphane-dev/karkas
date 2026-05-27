import { assert, reatomRoute } from '@reatom/core'
import { createElement, Fragment } from 'react'

assert(import.meta.env['BASE_URL'], 'BASE_URL must be set in the environment variables')
const base = import.meta.env['BASE_URL'].replace(/^\//, '')

export const rootRoute = reatomRoute(
	{ path: base, layout: true, render: (self) => self.outlet().at(0) ?? createElement(Fragment) },
	'rootRoute',
)
