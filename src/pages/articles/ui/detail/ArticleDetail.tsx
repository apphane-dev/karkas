import type { ArticleStatus } from '#entities/article'
import type { ArticleDetailModel } from '../../model/articleDetailModel'

import { createListCollection } from '@ark-ui/react/select'
import { wrap } from '@reatom/core'
import { bindField, reatomComponent } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import { Button, CollectionSelect, Heading, Input, Text } from '#shared/components'
import { reatomLoc } from '#shared/model'
import { styled } from '#styled-system/jsx'

import { ArticleStatusBadge } from '../ArticleStatusBadge'

const statusCollection = reatomLoc(
	() =>
		createListCollection({
			items: [
				{ label: 'Draft', value: 'draft' },
				{ label: 'In Progress', value: 'in-progress' },
				{ label: 'Done', value: 'done' },
			] as const satisfies ReadonlyArray<{ label: string; value: ArticleStatus }>,
			itemToString: (item) => item.label,
			itemToValue: (item) => item.value,
		}),
	'articleDetail.statusCollection',
)

export const ArticleDetail = reatomComponent(({ model }: { model: ArticleDetailModel }) => {
	if (model.isEditing()) {
		const isDirty = model.form.focus().dirty
		return (
			<styled.div p="8">
				<styled.form
					onSubmit={wrap((e) => {
						e.preventDefault()
						model.save()
					})}
				>
					<styled.div display="flex" flexDirection="column" gap="4">
						<Input
							{...bindField(model.form.fields.title)}
							size="sm"
							aria-label={m.article_edit_title()}
						/>
						<Input
							{...bindField(model.form.fields.description)}
							size="sm"
							aria-label={m.article_edit_description()}
						/>
						<CollectionSelect
							collection={statusCollection()}
							value={[model.form.fields.status.value()]}
							onValueChange={wrap(({ value }) =>
								model.form.fields.status.change((value[0] ?? 'draft') as ArticleStatus),
							)}
							aria-label={m.article_edit_status()}
							size="sm"
							positioning={{ sameWidth: true }}
						/>
						<styled.div display="flex" gap="3">
							{isDirty && (
								<Button loading={model.isSaving()} loadingText={m.article_saving()} type="submit">
									{m.article_save()}
								</Button>
							)}
							<Button variant="outline" onClick={wrap(() => model.cancelEdit())}>
								{m.article_cancel()}
							</Button>
						</styled.div>
					</styled.div>
				</styled.form>
			</styled.div>
		)
	}

	const current = model.current()
	return (
		<styled.div p="8">
			<styled.div display="flex" alignItems="center" gap="3" mb="6" flexWrap="wrap">
				<Heading as="h1" fontSize="2xl" fontWeight="bold" flex="1">
					{current.title}
				</Heading>
				<ArticleStatusBadge status={current.status} />
				<Button size="sm" variant="outline" onClick={wrap(() => model.startEdit())}>
					{m.article_edit()}
				</Button>
			</styled.div>
			<Text color="muted" fontSize="sm" lineHeight="relaxed">
				{current.description}
			</Text>
			<styled.div display="grid" gap="4" mt="6">
				{current.content.map((paragraph, index) => (
					// oxlint-disable-next-line react/no-array-index-key
					<Text key={index} color="muted" fontSize="sm" lineHeight="relaxed">
						{paragraph}
					</Text>
				))}
			</styled.div>
		</styled.div>
	)
}, 'ArticleDetail')
