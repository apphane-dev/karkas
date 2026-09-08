import type { ArticleStatus } from '#entities/article'
import type { ArticleDetailModel } from '../../model/articleDetailModel'

import { createListCollection } from '@ark-ui/react/select'
import { wrap } from '@reatom/core'
import { bindField, reatomComponent } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import {
	Alert,
	CollectionSelect,
	EditableCard,
	FormCta,
	FormReset,
	Input,
	Text,
} from '#shared/components'
import { reatomLoc } from '#shared/model'
import { formAlertMessage } from '#shared/reatom'
import { styled } from '#styled-system/jsx'

import { ArticleStatusBadge } from '../ArticleStatusBadge'

const statusCollection = reatomLoc(
	() =>
		createListCollection({
			items: [
				{ label: m.article_status_draft(), value: 'draft' },
				{ label: m.article_status_in_progress(), value: 'in-progress' },
				{ label: m.article_status_done(), value: 'done' },
			] satisfies ReadonlyArray<{ label: string; value: ArticleStatus }>,
			itemToString: (item) => item.label,
			itemToValue: (item) => item.value,
		}),
	'articleDetail.statusCollection',
)

export const ArticleDetail = reatomComponent(({ model }: { model: ArticleDetailModel }) => {
	const current = model.current()
	// Save failures here are network-level — no field owns them — so the
	// alert carries the whole failure and the edit stays on screen, dirty.
	const showSaveError = formAlertMessage(model.form) !== null

	return (
		<styled.div p="8">
			<EditableCard
				title={current.title}
				editLabel={m.article_edit()}
				closeLabel={m.article_close()}
				dirty={model.form.focus().dirty}
				onReset={wrap(() => model.form.reset())}
				rows={[
					{ label: m.article_edit_status(), value: <ArticleStatusBadge status={current.status} /> },
					{ label: m.article_edit_description(), value: current.description },
				]}
				preface={
					<styled.div display="grid" gap="4">
						{current.content.map((paragraph, index) => (
							// oxlint-disable-next-line react/no-array-index-key
							<Text key={index} color="muted" fontSize="sm" lineHeight="relaxed">
								{paragraph}
							</Text>
						))}
					</styled.div>
				}
			>
				<styled.form
					// A form without an accessible name has no implicit `form` role,
					// so tests and assistive tech cannot target it.
					aria-label={m.article_detail()}
					onSubmit={wrap((e) => {
						e.preventDefault()
						model.form.submit()
					})}
				>
					<styled.div display="flex" flexDirection="column" gap="4">
						{showSaveError && (
							<Alert.Root status="error" role="alert">
								<Alert.Indicator />
								<Alert.Content>
									<Alert.Title>{m.article_save_error()}</Alert.Title>
								</Alert.Content>
							</Alert.Root>
						)}
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
							<FormCta form={model.form}>{m.article_save()}</FormCta>
							<FormReset form={model.form} />
						</styled.div>
					</styled.div>
				</styled.form>
			</EditableCard>
		</styled.div>
	)
}, 'ArticleDetail')
