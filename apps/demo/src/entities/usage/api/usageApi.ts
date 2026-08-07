import type { UsageData } from '#entities/usage/model/types'

import { apiClient } from '#shared/api'

export const USAGE_API_PATH = '/usage'

export async function fetchUsageData() {
	return apiClient.get<UsageData>(USAGE_API_PATH)
}
