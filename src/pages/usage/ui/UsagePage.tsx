import type { UsageData } from '#entities/usage'
import type { ReactNode } from 'react'

import { ArrowRight, CheckCircle2, HardDrive, Sparkles, TriangleAlert } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { Badge, Button, Heading, Text, VisuallyHidden } from '#shared/components'
import { css } from '#styled-system/css'
import { styled } from '#styled-system/jsx'

import { UsageBar, USAGE_CRITICAL_THRESHOLD, USAGE_WARN_THRESHOLD } from './UsageBar'

type BreakdownKey = keyof UsageData['breakdown']

type BreakdownItem = {
	key: BreakdownKey
	label: string
	gb: number
	color: 'blue' | 'gray' | 'purple'
}

const formatGB = (gb: number) => {
	const fixed = Number.isInteger(gb) ? gb.toString() : gb.toFixed(1)
	return m.usage_gb({ value: fixed })
}

const usagePercent = (used: number, total: number) => {
	if (total <= 0) return 0
	return Math.round((used / total) * 100)
}

const usageHealth = (percentage: number) => {
	if (percentage >= USAGE_CRITICAL_THRESHOLD) {
		return {
			label: m.usage_health_critical(),
			description: m.usage_health_critical_desc(),
			colorPalette: 'red',
			icon: TriangleAlert,
		}
	}
	if (percentage >= USAGE_WARN_THRESHOLD) {
		return {
			label: m.usage_health_attention(),
			description: m.usage_health_attention_desc(),
			colorPalette: 'orange',
			icon: TriangleAlert,
		}
	}
	return {
		label: m.usage_health_healthy(),
		description: m.usage_health_healthy_desc(),
		colorPalette: 'green',
		icon: CheckCircle2,
	}
}

function BreakdownItemView({ item, total }: { item: BreakdownItem; total: number }) {
	const pct = usagePercent(item.gb, total)
	return (
		<styled.li
			listStyleType="none"
			p="4"
			borderWidth="1px"
			borderColor="border"
			borderRadius="xl"
			bg="gray.1"
		>
			<styled.div display="flex" alignItems="center" justifyContent="space-between" gap="3" mb="3">
				<styled.div>
					<styled.div fontSize="sm" fontWeight="semibold">
						{item.label}
					</styled.div>
					<Text fontSize="xs" color="muted">
						{m.usage_percentage_used({ percentage: pct })}
					</Text>
				</styled.div>
				<styled.div fontSize="lg" fontWeight="bold" fontVariantNumeric="tabular-nums">
					{formatGB(item.gb)}
				</styled.div>
			</styled.div>
			<UsageBar
				percentage={pct}
				color={item.color}
				ariaLabel={m.usage_breakdown_progress_label({ label: item.label })}
			/>
		</styled.li>
	)
}

function InsightPanel({
	title,
	description,
	children,
}: {
	title: string
	description: string
	children?: ReactNode
}) {
	return (
		<styled.article p="5" borderWidth="1px" borderColor="border" borderRadius="xl" bg="gray.1">
			<styled.div display="flex" gap="3" alignItems="flex-start">
				<styled.div
					aria-hidden
					display="grid"
					placeItems="center"
					w="9"
					h="9"
					borderRadius="full"
					bg="blue.subtle.bg"
					color="blue.subtle.fg"
					flexShrink={0}
				>
					<Sparkles className={css({ w: '4', h: '4' })} />
				</styled.div>
				<styled.div minW="0">
					<styled.div fontWeight="semibold" mb="1">
						{title}
					</styled.div>
					<Text fontSize="sm" color="muted">
						{description}
					</Text>
					{children}
				</styled.div>
			</styled.div>
		</styled.article>
	)
}

export function UsagePage({ data }: { data: UsageData }) {
	const { usedGB, totalGB, breakdown } = data
	const percentage = usagePercent(usedGB, totalGB)
	const freeGB = Math.max(totalGB - usedGB, 0)
	const health = usageHealth(percentage)
	const HealthIcon = health.icon
	const breakdownItems = [
		{ key: 'documents', label: m.usage_documents(), gb: breakdown.documents, color: 'blue' },
		{ key: 'media', label: m.usage_media(), gb: breakdown.media, color: 'purple' },
		{ key: 'other', label: m.usage_other(), gb: breakdown.other, color: 'gray' },
	] satisfies BreakdownItem[]
	const largest = breakdownItems.reduce((current, item) => (item.gb > current.gb ? item : current))
	const nextThreshold =
		percentage >= USAGE_CRITICAL_THRESHOLD
			? null
			: percentage >= USAGE_WARN_THRESHOLD
				? USAGE_CRITICAL_THRESHOLD
				: USAGE_WARN_THRESHOLD
	const gbUntilThreshold =
		nextThreshold === null ? 0 : Math.max((totalGB * nextThreshold) / 100 - usedGB, 0)

	return (
		<styled.main p={{ base: '5', md: '8' }} maxW="1040px" w="full">
			<styled.div mb="8" display="flex" flexDirection="column" gap="3">
				<Badge
					alignSelf="flex-start"
					variant="subtle"
					colorPalette={health.colorPalette}
					display="inline-flex"
					alignItems="center"
					gap="1.5"
				>
					<HealthIcon className={css({ w: '3.5', h: '3.5' })} aria-hidden />
					{health.label}
				</Badge>
				<styled.div
					display="flex"
					flexDirection={{ base: 'column', md: 'row' }}
					gap="4"
					justifyContent="space-between"
				>
					<styled.div maxW="640px">
						<Heading as="h1" fontSize={{ base: '2xl', md: '3xl' }} mb="2">
							{m.usage_title()}
						</Heading>
						<Text color="muted">{health.description}</Text>
					</styled.div>
					<Button size="sm" asChild alignSelf={{ base: 'stretch', md: 'flex-start' }}>
						<styled.a href="/pricing" display="inline-flex" alignItems="center" gap="2">
							{m.usage_manage_plan()}
							<ArrowRight className={css({ w: '4', h: '4' })} aria-hidden />
						</styled.a>
					</Button>
				</styled.div>
			</styled.div>

			<styled.section
				aria-label={m.usage_storage()}
				mb="6"
				p={{ base: '5', md: '6' }}
				borderWidth="1px"
				borderColor="border"
				borderRadius="2xl"
				bg="gray.1"
			>
				<styled.div display="flex" flexDirection={{ base: 'column', md: 'row' }} gap="6">
					<styled.div flex="1" minW="0">
						<styled.div
							display="flex"
							alignItems="center"
							justifyContent="space-between"
							gap="4"
							mb="3"
						>
							<styled.div display="flex" alignItems="center" gap="3">
								<styled.div
									aria-hidden
									display="grid"
									placeItems="center"
									w="10"
									h="10"
									borderRadius="full"
									bg="colorPalette.3"
									color="colorPalette.11"
								>
									<HardDrive className={css({ w: '5', h: '5' })} />
								</styled.div>
								<styled.div>
									<styled.div fontWeight="semibold">{m.usage_storage()}</styled.div>
									<Text fontSize="sm" color="muted">
										{m.usage_storage_desc({ usedGB, totalGB })}
									</Text>
								</styled.div>
							</styled.div>
							<styled.div textAlign="right">
								<styled.div fontSize="2xl" fontWeight="bold" fontVariantNumeric="tabular-nums">
									{percentage}%
								</styled.div>
								<Text fontSize="xs" color="muted">
									{m.usage_used()}
								</Text>
							</styled.div>
						</styled.div>
						<UsageBar
							percentage={percentage}
							height="3"
							ariaLabel={m.usage_storage_progress_label()}
						/>
						<styled.div
							display="flex"
							justifyContent="space-between"
							gap="3"
							mt="3"
							fontSize="sm"
							color="muted"
						>
							<span>{m.usage_free_remaining({ freeGB: formatGB(freeGB) })}</span>
							<span>{m.usage_total_capacity({ totalGB: formatGB(totalGB) })}</span>
						</styled.div>
					</styled.div>

					<styled.div w={{ base: 'full', md: '220px' }}>
						<styled.div fontSize="xs" fontWeight="semibold" color="muted" mb="1">
							{m.usage_next_milestone()}
						</styled.div>
						{nextThreshold === null ? (
							<Text fontSize="sm">{m.usage_over_critical_milestone()}</Text>
						) : (
							<>
								<styled.div fontSize="xl" fontWeight="bold" fontVariantNumeric="tabular-nums">
									{formatGB(gbUntilThreshold)}
								</styled.div>
								<Text fontSize="sm" color="muted">
									{m.usage_until_threshold({ threshold: nextThreshold })}
								</Text>
							</>
						)}
					</styled.div>
				</styled.div>
			</styled.section>

			<styled.section aria-labelledby="usage-breakdown-heading" mb="6">
				<Heading id="usage-breakdown-heading" fontSize="lg" mb="3">
					{m.usage_breakdown()}
				</Heading>
				<styled.ul
					display="grid"
					gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
					gap="3"
					p="0"
					m="0"
				>
					{breakdownItems.map((item) => (
						<BreakdownItemView key={item.key} item={item} total={totalGB} />
					))}
				</styled.ul>
			</styled.section>

			<styled.section aria-labelledby="usage-insights-heading">
				<styled.div display="flex" alignItems="end" justifyContent="space-between" gap="3" mb="3">
					<Heading id="usage-insights-heading" fontSize="lg">
						{m.usage_insights()}
					</Heading>
					<Text fontSize="sm" color="muted">
						{m.usage_reset_info()}
					</Text>
				</styled.div>
				<styled.div
					display="grid"
					gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
					gap="3"
				>
					<InsightPanel
						title={m.usage_largest_category_title({ category: largest.label })}
						description={m.usage_largest_category_desc({ amount: formatGB(largest.gb) })}
					/>
					<InsightPanel
						title={m.usage_cleanup_title()}
						description={m.usage_cleanup_desc({ category: largest.label.toLowerCase() })}
					>
						<VisuallyHidden>{m.usage_cleanup_accessible_hint()}</VisuallyHidden>
					</InsightPanel>
				</styled.div>
			</styled.section>
		</styled.main>
	)
}
