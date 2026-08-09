import type { Category } from '#entities/item'

import { Badge } from '#shared/components'

const categoryConfig = {
	electronics: {
		label: 'Electronics',
		bg: 'blue.subtle.bg',
		fg: 'blue.subtle.fg',
		border: 'blue.6',
	},
	furniture: {
		label: 'Furniture',
		bg: 'orange.subtle.bg',
		fg: 'orange.subtle.fg',
		border: 'orange.6',
	},
	clothing: {
		label: 'Clothing',
		bg: 'purple.subtle.bg',
		fg: 'purple.subtle.fg',
		border: 'purple.6',
	},
	food: { label: 'Food', bg: 'green.subtle.bg', fg: 'green.subtle.fg', border: 'green.6' },
} satisfies Record<Category, { label: string; bg: string; fg: string; border: string }>

export function CategoryBadge({ category }: { category: Category }) {
	const config = categoryConfig[category]
	return (
		<Badge size="sm" bg={config.bg} color={config.fg} borderWidth="1px" borderColor={config.border}>
			{config.label}
		</Badge>
	)
}
