import { css, cx } from '#styled-system/css'
import { styled } from '#styled-system/jsx'

/**
 * Storage utilization thresholds for the usage progress bar. At or above
 * {@link USAGE_WARN_THRESHOLD} the bar turns orange; at or above
 * {@link USAGE_CRITICAL_THRESHOLD} it turns red. Shared by {@link UsagePage}
 * so the health badge and milestone calculations stay in sync.
 */
export const USAGE_WARN_THRESHOLD = 70
export const USAGE_CRITICAL_THRESHOLD = 90

type UsageBarColor = 'blue' | 'gray' | 'orange' | 'purple' | 'red'

const rangeColorClass = {
	blue: css({ bg: 'blue.9' }),
	gray: css({ bg: 'gray.9' }),
	orange: css({ bg: 'orange.9' }),
	purple: css({ bg: 'purple.9' }),
	red: css({ bg: 'red.9' }),
} satisfies Record<UsageBarColor, string>

/** Maps a 0–100 utilization percentage to a semantic bar color. */
function usageBarColor(percentage: number): UsageBarColor {
	if (percentage >= USAGE_CRITICAL_THRESHOLD) return 'red'
	if (percentage >= USAGE_WARN_THRESHOLD) return 'orange'
	return 'blue'
}

type UsageBarProps = {
	percentage: number
	/** Panda spacing token for the bar height. Defaults to "1.5". */
	height?: '1.5' | '3'
	/** Override the threshold-derived color, e.g. always-blue breakdown rows. */
	color?: UsageBarColor
	/** Accessible label for interactive/standalone usage bars. */
	ariaLabel?: string
}

/**
 * Shared progress bar for the usage slice. Renders the track + range and applies
 * the threshold color logic in one place so {@link UsagePage} and
 * {@link UsageCard} stay in sync instead of duplicating the markup.
 */
export function UsageBar({ percentage, height = '1.5', color, ariaLabel }: UsageBarProps) {
	const boundedPercentage = Number.isFinite(percentage) ? Math.min(Math.max(percentage, 0), 100) : 0
	const rangeColor = color ?? usageBarColor(boundedPercentage)

	return (
		<styled.div
			w="full"
			h={height}
			bg="gray.4"
			borderRadius="full"
			overflow="hidden"
			{...(ariaLabel
				? {
						'aria-label': ariaLabel,
						'aria-valuemax': 100,
						'aria-valuemin': 0,
						'aria-valuenow': boundedPercentage,
						role: 'progressbar',
					}
				: {})}
		>
			<styled.div
				h="full"
				borderRadius="full"
				className={cx(css({ transition: 'width 0.2s ease' }), rangeColorClass[rangeColor])}
				style={{ width: `${boundedPercentage}%` }}
			/>
		</styled.div>
	)
}
