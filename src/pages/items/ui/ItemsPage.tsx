import type { Category, Item } from '#entities/item'

import { createListCollection } from '@ark-ui/react/select'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import { Badge, Button, CollectionSelect, VisuallyHidden } from '#shared/components'
import { reatomLoc } from '#shared/model'
import { styled } from '#styled-system/jsx'

import { categoryFilterAtom, sortDirAtom, sortFieldAtom, stockFilterAtom } from '../model/filters'
import { CategoryBadge } from './CategoryBadge'

const sortFieldCollection = reatomLoc(
	() =>
		createListCollection({
			items: [
				{ label: m.items_sort_name(), value: 'name' },
				{ label: m.items_sort_price(), value: 'price' },
			] as const satisfies ReadonlyArray<{ label: string; value: 'name' | 'price' }>,
			itemToString: (item) => item.label,
			itemToValue: (item) => item.value,
		}),
	'items.sortFieldCollection',
)

const categoryCollection = reatomLoc(
	() =>
		createListCollection({
			items: [
				{ label: m.items_filter_all(), value: 'all' },
				{ label: m.items_category_electronics(), value: 'electronics' },
				{ label: m.items_category_furniture(), value: 'furniture' },
				{ label: m.items_category_clothing(), value: 'clothing' },
				{ label: m.items_category_food(), value: 'food' },
			] as const satisfies ReadonlyArray<{ label: string; value: Category | 'all' }>,
			itemToString: (item) => item.label,
			itemToValue: (item) => item.value,
		}),
	'items.categoryCollection',
)

const stockCollection = reatomLoc(
	() =>
		createListCollection({
			items: [
				{ label: m.items_filter_all(), value: 'all' },
				{ label: m.items_stock_in_stock(), value: 'in-stock' },
				{ label: m.items_stock_out_of_stock(), value: 'out-of-stock' },
			] as const satisfies ReadonlyArray<{
				label: string
				value: 'all' | 'in-stock' | 'out-of-stock'
			}>,
			itemToString: (item) => item.label,
			itemToValue: (item) => item.value,
		}),
	'items.stockCollection',
)

type Props = {
	items: { item: Item; href: string }[]
}

export const ItemsPage = reatomComponent(({ items }: Props) => {
	const sortField = sortFieldAtom()
	const sortDir = sortDirAtom()
	const categoryFilter = categoryFilterAtom()
	const stockFilter = stockFilterAtom()

	let filtered = items.filter(({ item }) => {
		if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
		if (stockFilter === 'in-stock' && !item.inStock) return false
		if (stockFilter === 'out-of-stock' && item.inStock) return false
		return true
	})

	filtered = [...filtered].sort((left, right) => {
		const directionMultiplier = sortDir === 'asc' ? 1 : -1
		if (sortField === 'name') {
			return directionMultiplier * left.item.name.localeCompare(right.item.name)
		}
		return directionMultiplier * (left.item.price - right.item.price)
	})

	return (
		<styled.div p="6">
			<VisuallyHidden as="h1">{m.items_title()}</VisuallyHidden>

			<styled.div display="flex" flexWrap="wrap" gap="3" mb="6" alignItems="center">
				<styled.label fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap="2">
					{m.items_sort_by()}
					<CollectionSelect
						collection={sortFieldCollection()}
						size="sm"
						value={[sortField]}
						onValueChange={wrap(({ value }) =>
							sortFieldAtom.set(value[0] === 'price' ? 'price' : 'name'),
						)}
						positioning={{ sameWidth: true }}
					/>
				</styled.label>

				<Button
					variant="outline"
					size="sm"
					onClick={wrap(() => sortDirAtom.set(sortDirAtom() === 'asc' ? 'desc' : 'asc'))}
				>
					{sortDir === 'asc' ? m.items_sort_asc() : m.items_sort_desc()}
				</Button>

				<styled.label fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap="2">
					{m.items_label_category()}
					<CollectionSelect
						collection={categoryCollection()}
						size="sm"
						value={[categoryFilter]}
						onValueChange={wrap(({ value }) =>
							categoryFilterAtom.set(
								value[0] === 'electronics' ||
									value[0] === 'furniture' ||
									value[0] === 'clothing' ||
									value[0] === 'food'
									? value[0]
									: 'all',
							),
						)}
						positioning={{ sameWidth: true }}
					/>
				</styled.label>

				<styled.label fontSize="sm" fontWeight="medium" display="flex" alignItems="center" gap="2">
					{m.items_label_stock()}
					<CollectionSelect
						collection={stockCollection()}
						size="sm"
						value={[stockFilter]}
						onValueChange={wrap(({ value }) =>
							stockFilterAtom.set(
								value[0] === 'in-stock' || value[0] === 'out-of-stock' ? value[0] : 'all',
							),
						)}
						positioning={{ sameWidth: true }}
					/>
				</styled.label>
			</styled.div>

			<styled.p fontSize="sm" color="muted" mb="3">
				{m.items_found({ count: filtered.length })}
			</styled.p>

			<styled.div display="grid" gap="3">
				{filtered.map(({ item, href }) => (
					<styled.a
						key={item.id}
						href={href}
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						px="4"
						py="3"
						borderWidth="1px"
						borderColor="border"
						borderRadius="lg"
						textDecoration="none"
						color="inherit"
						_hover={{ bg: 'gray.surface.bg.active' }}
					>
						<styled.div display="flex" alignItems="center" gap="3">
							<styled.span fontWeight="medium" fontSize="sm">
								{item.name}
							</styled.span>
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
						<styled.span fontWeight="semibold" fontSize="sm" fontVariantNumeric="tabular-nums">
							${item.price.toFixed(2)}
						</styled.span>
					</styled.a>
				))}
				{filtered.length === 0 && (
					<styled.p color="muted" fontSize="sm" py="8" textAlign="center">
						{m.items_no_results()}
					</styled.p>
				)}
			</styled.div>
		</styled.div>
	)
}, 'ItemsPage')
