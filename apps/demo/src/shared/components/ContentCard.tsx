import type { ReactNode } from 'react'

import { styled } from '#styled-system/jsx'

/**
 * Generic content card: surface background, 1px border, resting xs shadow.
 * Header pairs a title with an optional muted subtitle and a right-aligned
 * action (a link or a small button).
 */
export function ContentCard({
	title,
	subtitle,
	action,
	children,
	padding = '24px',
	compact = false,
	headerGap = '5',
	...rest
}: {
	title?: ReactNode
	subtitle?: ReactNode
	action?: ReactNode
	children?: ReactNode
	padding?: string
	compact?: boolean
	headerGap?: string
} & Record<string, unknown>) {
	return (
		<styled.section
			bg="gray.surface.bg"
			borderWidth="1px"
			borderColor="border"
			borderRadius="l3"
			boxShadow="xs"
			p={compact ? '16px 24px' : padding}
			{...rest}
		>
			{/* Header stacks under sm so a wide action cluster can't crush the
			    title into a sliver on phones; row with a right-aligned action at
			    sm and up. `compact` centers the header instead (title + action on
			    one line, no subtitle to stack). */}
			{(title || action) && (
				<styled.header
					display="flex"
					flexDirection={{ base: 'column', sm: 'row' }}
					alignItems={
						compact ? { base: 'stretch', sm: 'center' } : { base: 'stretch', sm: 'flex-start' }
					}
					justifyContent="space-between"
					gap="4"
					mb={children ? headerGap : '0'}
				>
					<styled.div minW="0">
						{title && (
							<styled.h2 textStyle="lg" fontWeight="semibold" color="fg.default">
								{title}
							</styled.h2>
						)}
						{subtitle && (
							<styled.p textStyle="sm" color="fg.muted" mt="1">
								{subtitle}
							</styled.p>
						)}
					</styled.div>
					{action && (
						<styled.div display="flex" alignItems="center" flexShrink="0">
							{action}
						</styled.div>
					)}
				</styled.header>
			)}
			{children}
		</styled.section>
	)
}
