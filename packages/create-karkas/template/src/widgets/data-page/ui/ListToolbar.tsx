import { SlidersHorizontal } from 'lucide-react'
import { type ReactNode } from 'react'

import { m } from '#paraglide/messages.js'
import { Group, IconButton, Input } from '#shared/components'
import { styled } from '#styled-system/jsx'

type ListToolbarProps = {
	placeholder: string
	children?: ReactNode
	searchValue?: string
	onSearchChange?: (value: string) => void
}

export function ListToolbar({
	placeholder,
	children,
	searchValue,
	onSearchChange,
}: ListToolbarProps) {
	return (
		<styled.div px="3" py="3" borderBottomWidth="1px" borderColor="border">
			<Group attached w="full" colorPalette="gray">
				<Input
					aria-label={placeholder}
					placeholder={placeholder}
					size="sm"
					flex="1"
					value={searchValue}
					onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : undefined}
				/>
				<IconButton size="sm" variant="outline" aria-label={m.list_filters()}>
					<SlidersHorizontal />
				</IconButton>
				{children}
			</Group>
		</styled.div>
	)
}
