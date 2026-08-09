import type { DashboardData } from '#entities/dashboard/model/types'

import { apiClient } from '#shared/api'

export const DASHBOARD_API_PATH = '/dashboard'

export async function fetchDashboardData() {
	return apiClient.get<DashboardData>(DASHBOARD_API_PATH)
}
