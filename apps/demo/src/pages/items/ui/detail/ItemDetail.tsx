import type { Item } from '#entities/item'

import { m } from '#paraglide/messages.js'
import { Badge, Heading } from '#shared/components'
import { styled } from '#styled-system/jsx'

import { CategoryBadge } from '../CategoryBadge'

export function ItemDetail({ item }: { item: Item }) {
	return (
		<styled.div p="8" maxW="600px">
			<styled.div display="flex" alignItems="center" gap="3" mb="6">
				<Heading as="h1" fontSize="2xl" fontWeight="bold">
					{item.name}
				</Heading>
				<CategoryBadge category={item.category} />
				{!item.inStock && (
					<Badge
						size="sm"
						bg="red.subtle.bg"
						color="red.subtle.fg"
						borderWidth="1px"
						borderColor="red.6"
					>
						{m.items_stock_out_of_stock()}
					</Badge>
				)}
			</styled.div>

			<styled.dl display="grid" gap="3">
				<styled.div display="flex" gap="2">
					<styled.dt fontSize="sm" color="muted" w="24">
						{m.items_label_price()}
					</styled.dt>
					<styled.dd fontSize="sm" fontWeight="semibold" fontVariantNumeric="tabular-nums" m="0">
						${item.price.toFixed(2)}
					</styled.dd>
				</styled.div>
				<styled.div display="flex" gap="2">
					<styled.dt fontSize="sm" color="muted" w="24">
						{m.items_label_category()}
					</styled.dt>
					<styled.dd fontSize="sm" textTransform="capitalize" m="0">
						{item.category}
					</styled.dd>
				</styled.div>
				<styled.div display="flex" gap="2">
					<styled.dt fontSize="sm" color="muted" w="24">
						{m.items_label_stock()}
					</styled.dt>
					<styled.dd fontSize="sm" m="0">
						{item.inStock ? m.items_stock_in_stock() : m.items_stock_out_of_stock()}
					</styled.dd>
				</styled.div>
				<styled.div display="flex" gap="2">
					<styled.dt fontSize="sm" color="muted" w="24">
						{m.items_label_id()}
					</styled.dt>
					<styled.dd fontSize="sm" color="muted" fontVariantNumeric="tabular-nums" m="0">
						{item.id}
					</styled.dd>
				</styled.div>
			</styled.dl>
		</styled.div>
	)
}
