/// <reference types="vite-plus/client" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="msw-storybook-addon/types" />
import '@total-typescript/ts-reset'

import { type JSX } from 'react'

declare module '@reatom/core' {
	interface RouteChild extends JSX.Element {}
}
