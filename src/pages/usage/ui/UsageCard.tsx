import type { UsageData } from '#entities/usage'

import { reatomComponent } from '@reatom/react'

import { usageDataAtom } from '#entities/usage'
import { css } from '#styled-system/css'
import { styled } from '#styled-system/jsx'

type UsageCardProps = {
	active?: boolean
	data?: UsageData | undefined
	loadGlobal?: boolean
}

export const UsageCard = reatomComponent<UsageCardProps>(({ active, data, loadGlobal = true }) => {
	const globalData = loadGlobal ? usageDataAtom.data() : undefined
	const usageData = data ?? globalData
	const usedGB = usageData?.usedGB
	const totalGB = usageData?.totalGB
	const percentage =
		usedGB !== undefined && totalGB !== undefined ? Math.round((usedGB / totalGB) * 100) : null

	return (
		<styled.div
			px="2"
			py="2"
			borderRadius="md"
			bg={active ? 'colorPalette.surface.bg.active' : 'transparent'}
			_hover={{ bg: 'colorPalette.surface.bg.active' }}
			cursor="pointer"
			w="full"
			className={css({ '[data-sidebar-collapsed] &': { display: 'none' } })}
		>
			<styled.div
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				mb="1"
				fontSize="xs"
				color="muted"
			>
				<styled.span fontWeight="medium" color="gray.12">
					Storage
				</styled.span>
				<styled.span>
					{usedGB !== undefined && totalGB !== undefined ? `${usedGB} GB / ${totalGB} GB` : '—'}
				</styled.span>
			</styled.div>
			<styled.div w="full" h="1.5" bg="gray.4" borderRadius="full" overflow="hidden">
				<styled.div
					h="full"
					bg={
						percentage !== null && percentage >= 90
							? 'red.9'
							: percentage !== null && percentage >= 70
								? 'orange.9'
								: 'blue.9'
					}
					borderRadius="full"
					style={{ width: `${percentage ?? 0}%` }}
				/>
			</styled.div>
			<styled.div fontSize="xs" color="muted" mt="0.5">
				{percentage !== null ? `${percentage}% used` : '—'}
			</styled.div>
		</styled.div>
	)
}, 'UsageCard')
