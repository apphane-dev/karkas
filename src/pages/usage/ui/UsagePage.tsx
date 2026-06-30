import type { UsageData } from '#entities/usage'

import { m } from '#paraglide/messages.js'
import { Button, Heading, Text, VisuallyHidden } from '#shared/components'
import { styled } from '#styled-system/jsx'

import { UsageBar } from './UsageBar'

function BreakdownRow({ label, gb, total }: { label: string; gb: number; total: number }) {
	const pct = Math.round((gb / total) * 100)
	return (
		<styled.div display="flex" alignItems="center" gap="3" py="2">
			<styled.div flex="1" fontSize="sm">
				{label}
			</styled.div>
			<styled.div fontSize="sm" color="muted" w="16" textAlign="right">
				{gb} GB
			</styled.div>
			<styled.div w="24">
				<UsageBar percentage={pct} color="blue.9" />
				<VisuallyHidden>{m.usage_percentage_used({ percentage: pct })}</VisuallyHidden>
			</styled.div>
		</styled.div>
	)
}

export function UsagePage({ data }: { data: UsageData }) {
	const { usedGB, totalGB, breakdown } = data
	const percentage = Math.round((usedGB / totalGB) * 100)
	return (
		<styled.div p="8" maxW="600px">
			<VisuallyHidden as="h1">{m.usage_title()}</VisuallyHidden>

			<styled.div mb="8">
				<styled.div display="flex" alignItems="center" justifyContent="space-between" mb="2">
					<styled.span fontWeight="medium">{m.usage_storage()}</styled.span>
					<styled.div display="flex" alignItems="center" gap="3">
						<styled.span fontSize="sm" color="muted">
							{m.usage_storage_desc({ usedGB, totalGB })}
						</styled.span>
						<Button size="xs" variant="outline" asChild>
							<styled.a href="/pricing">{m.usage_manage_plan()}</styled.a>
						</Button>
					</styled.div>
				</styled.div>
				<styled.div mb="1">
					<UsageBar percentage={percentage} height="3" />
				</styled.div>
				<styled.div fontSize="sm" color="muted">
					{m.usage_percentage_used({ percentage })}
				</styled.div>
			</styled.div>

			<styled.div mb="8">
				<Heading fontSize="lg" mb="3">
					{m.usage_breakdown()}
				</Heading>
				<styled.div borderWidth="1px" borderColor="border" borderRadius="lg" px="4" divideY="1px">
					<BreakdownRow label={m.usage_documents()} gb={breakdown.documents} total={totalGB} />
					<BreakdownRow label={m.usage_media()} gb={breakdown.media} total={totalGB} />
					<BreakdownRow label={m.usage_other()} gb={breakdown.other} total={totalGB} />
				</styled.div>
			</styled.div>

			<Text fontSize="sm" color="muted">
				{m.usage_reset_info()}
			</Text>
		</styled.div>
	)
}
