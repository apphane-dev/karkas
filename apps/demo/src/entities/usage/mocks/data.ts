import type { UsageData } from '#entities/usage/model/types'

export const usageMockData = {
	usedGB: 4.2,
	totalGB: 10,
	breakdown: { documents: 1.8, media: 2.1, other: 0.3 },
} satisfies UsageData
