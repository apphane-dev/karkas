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
}
