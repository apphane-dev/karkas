import { Select } from './ui'

type SelectOption = { label: string; value: string }

type CollectionSelectProps<T extends SelectOption> = Omit<Select.RootProps<T>, 'children'>

export function CollectionSelect<T extends SelectOption>({
	collection,
	...props
}: CollectionSelectProps<T>) {
	const items = Array.isArray(collection?.items) ? collection.items : []
	if (items.length === 0) return null

	return (
		<Select.Root collection={collection} {...props}>
			<Select.Control>
				<Select.Trigger>
					<Select.ValueText />
					<Select.IndicatorGroup>
						<Select.Indicator />
					</Select.IndicatorGroup>
				</Select.Trigger>
			</Select.Control>
			<Select.Positioner>
				<Select.Content>
					{items.map((item) => (
						<Select.Item key={item.value} item={item}>
							<Select.ItemText>{item.label}</Select.ItemText>
							<Select.ItemIndicator />
						</Select.Item>
					))}
				</Select.Content>
			</Select.Positioner>
			<Select.HiddenSelect />
		</Select.Root>
	)
}
