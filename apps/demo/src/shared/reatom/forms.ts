import type {
	Action,
	AtomLike,
	Computed,
	FieldAtom,
	FieldFocus,
	Form,
	SubmitAction,
} from '@reatom/core'

import { action, atom, withCallHook } from '@reatom/core'

type PreventableEvent = { preventDefault(): void }

/**
 * Adds a host-event submit action so ordinary forms do not repeat DOM bridging boilerplate.
 * Adapted from reatom/reusables `with-form-submit-handler`.
 * The component must still pass `wrap(form.handleSubmit)` to its host-managed form element.
 */
export const withFormSubmitHandler =
	() =>
	<Target extends Form<any>>(form: Target) => {
		const submitValidationError = atom(false, `${form.name}.submitValidationError`)
		form.submit.onReject.extend(
			withCallHook(() => submitValidationError.set(form.validation().errors.length > 0)),
		)
		form.submit.onFulfill.extend(withCallHook(() => submitValidationError.set(false)))

		return {
			handleSubmit: action((event?: PreventableEvent) => {
				event?.preventDefault()
				form.submit()
			}, `${form.name}.handleSubmit`),
			submitValidationError,
		}
	}

/**
 * Focuses the first invalid field after submit rejection when its element ref is connected.
 * Adapted from reatom/reusables `with-form-auto-focus-on-error`.
 */
export const withFormAutoFocusOnError =
	() =>
	<Target extends Form<any>>(form: Target): Target => {
		form.submit.onReject.extend(
			withCallHook(() => {
				form
					.fieldsList()
					.find((field) => field.validation().error)
					?.elementRef()
					?.focus()
			}),
		)
		return form
	}

/**
 * Scrolls the first invalid field or section-level error into view when
 * submit is rejected.
 *
 * `withFormAutoFocusOnError` only reaches fields with a wired `elementRef`.
 * Fields that validate a whole array of row objects (entry lists, item
 * mappings, …) have no single input to point an `elementRef` at, so their
 * error renders below the row list instead as a plain `role="alert"` element
 * — and every Ark UI `Field.Root` already stamps a `data-invalid` attribute
 * on itself (and its descendants) when invalid, boolean-style — present with
 * an empty value, not `data-invalid="true"` — so `[data-invalid]` (not
 * `[data-invalid="true"]`) is what actually matches. With no wiring required,
 * this scrolls to whichever of the two the submit rejection left on screen —
 * the first invalid thing in document order — so a multi-section wizard form
 * no longer strands the user next to the submit button while the actual
 * unfilled field sits off-screen above the fold. Runs after a frame so the
 * rejection's error text has painted first.
 */
// fallow-ignore-next-line unused-export
export const withFormScrollToErrorOnReject =
	() =>
	<Target extends Form<any>>(form: Target): Target => {
		form.submit.onReject.extend(
			withCallHook(() => {
				requestAnimationFrame(() => {
					const target = document.querySelector<HTMLElement>('[data-invalid], [role="alert"]')
					target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
					target
						?.querySelector<HTMLElement>('input, select, button, textarea')
						?.focus({ preventScroll: true })
				})
			}),
		)
		return form
	}

/** The structural slice of a `reatomForm` this extension drives. */
type FormLike = AtomLike & {
	focus: Computed<FieldFocus>
	submit: SubmitAction<any, any>
	init: Action<any, void>
	reset: Action<any, void>
}

/** The structural slice `formAlertMessage` reads. */
type FormWithSubmitError = {
	validation: () => { errors: ReadonlyArray<unknown> }
	submit: {
		error: () => Error | null | undefined
		ready?: () => boolean
	}
	submitValidationError?: () => boolean
}

/**
 * The message a form-level alert may show, or `null` for no alert.
 *
 * The alert exists for failures no field can carry — a network error, a server
 * message about the record as a whole. Two kinds of failure reach `submit.error`
 * that are already on the fields, and repeating them there prints the same
 * sentence twice:
 *
 * A field validation failure reaches `submit.error` as a plain Error carrying a
 * copy of the first field message. API validation can do the same after its
 * issues are mapped onto fields. In either case, the aggregate validation state
 * tells us the message already has a field-level owner.
 *
 * A mapped API error outlives the field error it produced: editing the field
 * clears its validation entry, but `submit.error()` keeps the rejected request
 * until a submit succeeds. Callers that map a submit error elsewhere pass an
 * `isHandled` predicate so that stale request error cannot migrate into this
 * alert. Errors no field or mapper owns stay visible here.
 *
 * While a submission is pending the alert is suppressed: the retained error
 * belongs to the previous attempt, and the loading state is the feedback.
 */
export function formAlertMessage(form: FormWithSubmitError, isHandled?: (error: Error) => boolean) {
	const error = form.submit.error()
	// `submit.error()` is retained until a later submit fulfills, so while a
	// re-submission is in flight the stale text would sit beside the loading
	// state. Nothing is announced until that attempt settles.
	if (!error || form.submit.ready?.() === false) return null
	if (form.submitValidationError?.() || isHandled?.(error)) return null
	return form.validation().errors.length > 0 ? null : error.message
}

/**
 * The field error that should currently be visible to the user.
 *
 * `keepErrorOnChange: false` keeps the last issue in Reatom for bookkeeping but
 * drops its `triggered` flag. Reading only `validation.error` would therefore
 * leave stale copy visible while the user fixes the value.
 */
export function visibleFieldError(field: Pick<FieldAtom<unknown>, 'validation'>) {
	const validation = field.validation()
	return validation.triggered ? validation.error : undefined
}

/**
 * What a settings form must do once its save lands, so the UI stops claiming
 * there is something left to save. The post-save state is driven ENTIRELY by
 * what `onSubmit` RETURNS:
 *
 * - a truthy payload makes those values the form's new baseline, so it reads as
 *   clean: the submit CTA demotes, the reset affordance disappears, and the
 *   inputs keep showing what was saved. Applied with `init`, not `reset`.
 * - returning nothing (or `null`) clears the form to its empty baseline with
 *   `reset` — for write-only credential forms, where the secret must not
 *   linger and there is nothing to read back.
 *
 * `onSaved` runs after that. Disclosure cards use it to collapse back to their
 * summary rows — landing on rows that now state the new values is what confirms
 * the save, without a toast claiming it.
 *
 * Two details matter about the rebaseline path:
 *
 * - the returned payload is what was actually persisted. Reading the form's
 *   live state at fulfilment instead would adopt anything typed while the
 *   request was in flight — edits that were never sent — as "saved". (Snapshot
 *   at call time does not work either: `withCallHook` on `submit` fires after
 *   the async body, by which point the state has already moved.)
 * - `init` rebaselines without overwriting the current values, so an in-flight
 *   edit survives AND keeps the form dirty. `reset(values)` would clobber it —
 *   verified against @reatom/core.
 *
 * So a form with persistent values must `return` them from `onSubmit`; a
 * write-only form returns nothing and is cleared by `reset`. Do not use the
 * form's own `resetOnSubmit` option — this extension is the single place
 * post-save clearing is decided, and two owners of that decision disagree.
 *
 * Applied to the form itself (not to a component) because both effects are
 * state, not presentation: any card, drawer or page rendering the form gets
 * the same post-save behaviour.
 *
 * Note: `reatomForm` clears `submit.data`/`submit.error` on reset, so never
 * build a "saved" indicator on `submit.data()`.
 */
export const withSavedState =
	({ onSaved }: { onSaved?: () => void } = {}) =>
	<Target extends FormLike>(target: Target) => {
		// `onFulfill` fires only on resolution — withAsync routes aborts to
		// `onSettle` and failures to `onReject` — and its hook body already runs
		// inside a Reatom frame, so no `wrap` is needed here. Its first param is
		// whatever `onSubmit` returned.
		target.submit.onFulfill.extend(
			withCallHook((_call, [persisted]) => {
				if (persisted) {
					target.init(persisted)
				} else {
					target.reset()
				}
				onSaved?.()
			}),
		)
		return target
	}
