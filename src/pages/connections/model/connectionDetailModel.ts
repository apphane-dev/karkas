import type { Connection } from '#entities/connection'

import { action, framePromise, sleep, withAbort, wrap } from '@reatom/core'

import { m } from '#paraglide/messages.js'
import { toaster } from '#shared/components'

const CONNECTION_CHECK_DELAY_MS = 300

async function showConnectionToast({
	loadingTitle,
	successTitle,
	connectionName,
}: {
	loadingTitle: string
	successTitle: string
	connectionName: string
}) {
	const id = toaster.create({ title: loadingTitle, type: 'loading', closable: false })
	let completed = false

	void framePromise()
		.finally(() => {
			if (!completed) toaster.remove(id)
		})
		.catch(() => {})

	await wrap(sleep(CONNECTION_CHECK_DELAY_MS))
	toaster.update(id, {
		title: successTitle,
		description: connectionName,
		type: 'success',
	})
	completed = true
}

export function createConnectionDetailModel(connection: Connection) {
	return {
		connection,
		testConnection: action(
			async () =>
				showConnectionToast({
					loadingTitle: m.connection_testing(),
					successTitle: m.connection_successful(),
					connectionName: connection.name,
				}),
			`connections.detail#${connection.id}.testConnection`,
		).extend(withAbort()),
		reconnect: action(
			async () =>
				showConnectionToast({
					loadingTitle: m.connection_reconnecting(),
					successTitle: m.connection_reconnected_successfully(),
					connectionName: connection.name,
				}),
			`connections.detail#${connection.id}.reconnect`,
		).extend(withAbort()),
	}
}

export type ConnectionDetailModel = ReturnType<typeof createConnectionDetailModel>
