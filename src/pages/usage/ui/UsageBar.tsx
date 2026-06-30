import { styled } from '#styled-system/jsx'

/**
 * Storage utilization thresholds for the usage progress bar. At or above
 * {@link USAGE_WARN_THRESHOLD} the bar turns orange; at or above
 * {@link USAGE_CRITICAL_THRESHOLD} it turns red.
 */
const USAGE_WARN_THRESHOLD = 70
const USAGE_CRITICAL_THRESHOLD = 90

/** Maps a 0–100 utilization percentage to a semantic bar color token. */
function usageBarColor(percentage: number): string {
	if (percentage >= USAGE_CRITICAL_THRESHOLD) return 'red.9'
	if (percentage >= USAGE_WARN_THRESHOLD) return 'orange.9'
	return 'blue.9'
}

type UsageBarProps = {
	percentage: number
	/** Panda spacing token for the bar height. Defaults to "1.5". */
	height?: '1.5' | '3'
	/** Override the threshold-derived color, e.g. always-blue breakdown rows. */
	color?: string
}

/**
 * Shared progress bar for the usage slice. Renders the track + range and applies
 * the threshold color logic in one place so {@link UsagePage} and
 * {@link UsageCard} stay in sync instead of duplicating the markup.
 */
export function UsageBar({ percentage, height = '1.5', color }: UsageBarProps) {
	return (
		<styled.div w="full" h={height} bg="gray.4" borderRadius="full" overflow="hidden">
			<styled.div
				h="full"
				bg={color ?? usageBarColor(percentage)}
				borderRadius="full"
				style={{ width: `${percentage}%` }}
			/>
		</styled.div>
	)
}
