export type UsageBreakdown = {
	documents: number
	media: number
	other: number
}

export type UsageData = {
	usedGB: number
	totalGB: number
	breakdown: UsageBreakdown
}
