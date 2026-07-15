export async function startBrowserMocking() {
	const enableMswEnvironmentValue = import.meta.env['VITE_ENABLE_MSW']
	const shouldEnableMocking =
		enableMswEnvironmentValue === undefined || enableMswEnvironmentValue === 'true'

	if (!shouldEnableMocking) {
		return
	}

	const { handlersArray } = await import('./handlers.ts')

	const { setupWorker } = await import('msw/browser')
	const worker = setupWorker(...handlersArray)

	await worker.start({
		onUnhandledRequest: import.meta.env['PROD'] ? 'bypass' : 'warn',
		serviceWorker: {
			url: `${import.meta.env['BASE_URL']}mockServiceWorker.js`,
		},
	})

	// E2E-only: expose window.__mockControl for runtime handler overrides.
	// `__ENABLE_MOCK_CONTROL__` is a Vite define (see vite.config.ts), so this
	// whole branch — and the dynamic import — is dead-code-eliminated from the
	// public build.
	if (__ENABLE_MOCK_CONTROL__) {
		const { installMockControl } = await import('./mockControl.ts')
		installMockControl(worker)
	}
}
