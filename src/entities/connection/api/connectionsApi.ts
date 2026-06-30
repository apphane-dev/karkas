import type { Connection } from '#entities/connection/model/types'

import { apiClient } from '#shared/api'

export const CONNECTIONS_API_PATH = '/connections'

export async function fetchConnections(options?: Pick<RequestInit, 'signal'>) {
	return apiClient.get<Connection[]>(CONNECTIONS_API_PATH, options)
}

export async function fetchConnectionById(
	connectionId: string,
	options?: Pick<RequestInit, 'signal'>,
) {
	return apiClient.get<Connection>(`${CONNECTIONS_API_PATH}/${connectionId}`, options)
}
