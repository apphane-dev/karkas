/// <reference types="vite-plus/client" />
/// <reference types="vite-plugin-svgr/client" />
import '@total-typescript/ts-reset'

import { type JSX } from 'react/jsx-runtime'

declare module '@reatom/core' {
	interface RouteChild extends JSX.Element {}
}
