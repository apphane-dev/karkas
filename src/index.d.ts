/// <reference types="vite-plus/client" />
/// <reference types="vite-plugin-svgr/client" />
import '@total-typescript/ts-reset'

import { type JSX } from 'react'

declare module '@reatom/core' {
	interface RouteChild extends JSX.Element {}
}

// Vite define (see vite.config.ts). True only in E2E builds; false in the
// public build so the mock-control hook is dead-code eliminated.
declare global {
	const __ENABLE_MOCK_CONTROL__: boolean
}
