import type { Connection } from '#entities/connection/model/types'

import { apiClient } from '#shared/api'

export const CONNECTIONS_API_PATH = '/connections'

export async function fetchConnections() {
	return apiClient.get<Connection[]>(CONNECTIONS_API_PATH)
}

export async function fetchConnectionById(connectionId: string) {
	return apiClient.get<Connection>(`${CONNECTIONS_API_PATH}/${connectionId}`)
}
