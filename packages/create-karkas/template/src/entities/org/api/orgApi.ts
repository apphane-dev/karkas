import type { Org } from '#entities/org/model/types'

import { apiClient } from '#shared/api'

export const ORGS_API_PATH = '/orgs'

export async function fetchOrgs() {
	return apiClient.get<Org[]>(ORGS_API_PATH)
}
