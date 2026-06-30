import type { UsageData } from '#entities/usage'

import { reatomComponent } from '@reatom/react'

import { usageDataAtom } from '#entities/usage'
import { m } from '#paraglide/messages.js'
import { css } from '#styled-system/css'
import { styled } from '#styled-system/jsx'

import { UsageBar } from './UsageBar'

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
					{m.usage_storage()}
				</styled.span>
				<styled.span>
					{usedGB !== undefined && totalGB !== undefined
						? m.usage_storage_desc({ usedGB, totalGB })
						: '—'}
				</styled.span>
			</styled.div>
			{percentage !== null && <UsageBar percentage={percentage} />}
			<styled.div fontSize="xs" color="muted" mt="0.5">
				{percentage !== null ? m.usage_percentage_used({ percentage }) : '—'}
			</styled.div>
		</styled.div>
	)
}, 'UsageCard')
