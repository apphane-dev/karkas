import type { ReactNode } from 'react'

import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Save, Undo2 } from 'lucide-react'

import { m } from '#paraglide/messages.js'

import { Button } from './ui'

/**
 * The minimal structural surface of a `reatomForm` these widgets drive. Kept
 * structural (not `FormAtom`) so any form — plain or extended — fits without
 * generics plumbing.
 */
type EditableForm = {
	focus: () => { dirty: boolean }
	submit: { (): unknown; ready: () => boolean }
	reset: () => void
}

/**
 * The submit CTA for an edit form: a quiet outline button while the form is
 * clean, promoted to the filled primary once any field diverges from its saved
 * value. It remains actionable so submit-time validation can explain an
 * incomplete draft; only the loading state temporarily blocks duplicate work.
 */
export const FormCta = reatomComponent(
	({ form, children }: { form: EditableForm; children: ReactNode }) => {
		const dirty = form.focus().dirty
		return (
			<Button
				type="submit"
				variant={dirty ? 'solid' : 'outline'}
				colorPalette="indigo"
				size="sm"
				loading={!form.submit.ready()}
				loadingText={m.form_saving()}
			>
				<Save size={16} />
				{children}
			</Button>
		)
	},
	'FormCta',
)

/**
 * The explicit way back to the saved values: renders only while the form is
 * dirty and discards the whole draft. `onReset` replaces the default
 * `form.reset()` when the caller must also clear derived state (e.g. remount
 * uncontrolled inputs).
 */
export const FormReset = reatomComponent(
	({ form, onReset }: { form: EditableForm; onReset?: () => void }) => {
		if (!form.focus().dirty) return null
		return (
			<Button
				type="button"
				variant="plain"
				colorPalette="red"
				size="sm"
				onClick={wrap(() => (onReset ?? form.reset)())}
			>
				<Undo2 size={16} />
				{m.form_reset_changes()}
			</Button>
		)
	},
	'FormReset',
)
