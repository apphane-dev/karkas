import { css } from '#styled-system/css'

import { Select } from './ui'

type SelectOption = { label: string; value: string }

type CollectionSelectProps<T extends SelectOption> = Omit<Select.RootProps<T>, 'children'> & {
	label?: string
}

function getCollectionItems<T extends SelectOption>(
	collection: CollectionSelectProps<T>['collection'],
) {
	return Array.isArray(collection?.items) ? collection.items : []
}

function CollectionSelectLabel({ label }: { label: string | undefined }) {
	if (!label) return null
	return <Select.Label className={css({ srOnly: true })}>{label}</Select.Label>
}

function CollectionSelectItems<T extends SelectOption>({ items }: { items: T[] }) {
	return items.map((item) => (
		<Select.Item key={item.value} item={item}>
			<Select.ItemText>{item.label}</Select.ItemText>
			<Select.ItemIndicator />
		</Select.Item>
	))
}

export function CollectionSelect<T extends SelectOption>({
	collection,
	label,
	...props
}: CollectionSelectProps<T>) {
	const items = getCollectionItems(collection)
	if (items.length === 0) return null

	return (
		<Select.Root collection={collection} {...props}>
			<CollectionSelectLabel label={label} />
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
					<CollectionSelectItems items={items} />
				</Select.Content>
			</Select.Positioner>
			<Select.HiddenSelect />
		</Select.Root>
	)
}
