import type { ReactNode } from 'react'

import { wrap } from '@reatom/core'
import { reatomComponent, useAtom } from '@reatom/react'
import { Pencil, TriangleAlert, Undo2, X } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { styled } from '#styled-system/jsx'

import { ContentCard } from './ContentCard'
import { SwapLabel } from './SwapLabel'
import { Button } from './ui'

/**
 * `key` is optional and defaults to `label` — set it explicitly when a card
 * emits more than one row sharing the same label (e.g. one row per field for
 * each item of a mapping list), so React's list key stays unique per row
 * instead of colliding on the repeated label text.
 */
// fallow-ignore-next-line unused-type
export type DisplayRow = { key?: string; label: string; value: ReactNode }

/**
 * Height-animated disclosure region: 0fr→1fr grid track with an opacity
 * cross-fade, so swapping the rows for the form eases instead of hard-cutting.
 * Both regions stay mounted, which is what lets drafts in uncontrolled inputs
 * survive a close.
 *
 * `visibility` is what actually takes the closed region out of the
 * accessibility tree and the tab order, and it is deliberately NOT eased: it
 * applies instantly on open (so the revealed content is focusable and readable
 * from the first frame) and is delayed until the collapse finishes on close
 * (so the outgoing content stays visible while it shrinks). `overflow` follows
 * the same schedule for the opposite reason — it must clip while the row
 * shrinks, but clipping the settled open state would cut the focus ring off
 * any control at the content's edge.
 *
 * Every value below is a static literal, including both branches of each
 * ternary: Panda extracts styles at build time, so an interpolated duration
 * would emit a class name with no rule behind it and silently drop the
 * animation.
 */
// fallow-ignore-next-line unused-export
export const Reveal = ({ open, children }: { open: boolean; children: ReactNode }) => (
	<styled.div
		// Semantics leave immediately, pixels leave on the animation's schedule.
		// Without this the collapsing region stays in the accessibility tree and
		// the tab order for the length of the transition, so a control that exists
		// in both the closed and the open branch (the reset affordance) would be
		// exposed twice at once.
		aria-hidden={!open || undefined}
		inert={!open || undefined}
		display="grid"
		gridTemplateRows={open ? '1fr' : '0fr'}
		opacity={open ? 1 : 0}
		// Inherit rather than assert `visible` when open: an explicit `visible`
		// on a nested Reveal would override a hidden ancestor's, leaking the
		// inner content (its inputs, its tab stops) out of a collapsed card.
		visibility={open ? undefined : 'hidden'}
		transition={
			open
				? 'grid-template-rows 240ms ease, opacity 200ms ease, visibility 0s linear 0s'
				: 'grid-template-rows 240ms ease, opacity 200ms ease, visibility 0s linear 240ms'
		}
		_motionReduce={{ transition: 'none' }}
	>
		<styled.div
			overflow={open ? 'visible' : 'hidden'}
			// The clip only applies to descendants whose containing block is inside
			// the clipper. Ark UI's selects park visually-hidden labels and native
			// <select>s at `position: absolute`; without a positioned ancestor here
			// they'd anchor to the page and stretch its scroll height by the full
			// height of the collapsed content.
			position="relative"
			minH="0"
			// `allow-discrete` is what lets a non-interpolable property be scheduled
			// like this; without it the switch happens at once, which only costs a
			// brief overflow during the expand.
			transition={open ? 'overflow 0s linear 240ms' : 'overflow 0s linear 0s'}
			transitionBehavior="allow-discrete"
			_motionReduce={{ transition: 'none' }}
		>
			{children}
		</styled.div>
	</styled.div>
)

/**
 * Externally-owned open state for the card. The page usually derives it from a
 * single "which panel is open" atom, which is what makes several cards behave
 * as an accordion — opening one closes the others.
 */
type CardDisclosure = {
	isOpen: () => boolean
	setOpen: (open: boolean) => void
}

/**
 * Display/edit card: labelled value rows when closed, a header-right toggle
 * that swaps the rows for the edit form, and a single named submit inside the
 * form. The rows and the form never show together — the form's inputs already
 * state the current values, so keeping the rows above them would print every
 * value twice. The form stays the caller's content (`children`); this widget
 * owns only the disclosure and the read-only rows so every settings card reads
 * the same way — a card that states its current values and opens to edit them,
 * never a permanently-open wall of inputs.
 *
 * Closing does NOT discard the draft (that's why the toggle says "Close", not
 * "Cancel"): when the card is closed over a dirty form (`dirty` prop), a
 * warning row states that unsaved changes are kept and offers the two honest
 * exits — continue editing, or reset the draft (`onReset`).
 *
 * `preface` is content that belongs to the same subject but is not part of the
 * edit at all — a server-computed value the user copies out. It sits above the
 * disclosure and stays put through both states, so opening the form to change
 * one half of a setting doesn't hide the other half.
 *
 * `hint` is contextual help for the open form, rendered as a sibling BELOW the
 * card (not nested inside it — avoids a framed box inside a framed card). The
 * hint sits in its own `Reveal` keyed to the card's open state, so it animates
 * in and out together with the form. The card and hint share one grid wrapper
 * with no gap: the hint's own top spacing lives inside its `Reveal`, where the
 * 0fr track clips it to nothing while collapsed, so no phantom space is left
 * when the card is closed. Callers that also surface the same content in a
 * sidebar on wide screens wrap it in a `display`-per-breakpoint container so
 * only one of the two shows at a time.
 */
// fallow-ignore-next-line unused-export
export const EditableCard = reatomComponent(function EditableCard({
	title,
	subtitle,
	ariaLabel,
	editLabel,
	closeLabel,
	preface,
	rows,
	hint,
	children,
	defaultOpen = false,
	disclosure,
	dirty = false,
	onReset,
}: {
	title?: ReactNode
	subtitle?: ReactNode
	/**
	 * Accessible name for the card's region landmark. Defaults to `title` when it
	 * is a plain string, so callers rarely pass it — it lets tests (and screen
	 * readers) scope to "the card titled X" without extra wiring.
	 */
	ariaLabel?: string
	editLabel: string
	closeLabel: string
	/** Always-visible content above the disclosure, in both states. */
	preface?: ReactNode
	/** Contextual help for the open form, revealed below it. */
	hint?: ReactNode
	rows: Array<DisplayRow>
	children: ReactNode
	defaultOpen?: boolean
	/** External open state (accordion). Omit for local, uncontrolled disclosure. */
	disclosure?: CardDisclosure
	/** The edit form has a draft diverging from the saved values. */
	dirty?: boolean
	/** Discards the draft; required for the unsaved-changes warning's Reset. */
	onReset?: () => void
}) {
	const [localOpen, setLocalOpen] = useAtom(defaultOpen, [], 'EditableCard.localOpen')
	const open = disclosure ? disclosure.isOpen() : localOpen
	const setOpen = disclosure ? disclosure.setOpen : setLocalOpen
	const regionLabel = ariaLabel ?? (typeof title === 'string' ? title : undefined)
	// A card whose values are all write-only (rows={[]}, no preface) has
	// nothing to show at rest — the header-to-body gap survived as dead air
	// below the subtitle with no body to space it from. Collapse it only for
	// that exact state; the moment there's a preface, a summary row, an
	// unsaved-changes banner, or the form is open, the gap is real again.
	const hasRestingContent = Boolean(preface) || rows.length > 0 || dirty
	// The divider under `preface` separates it from a resting summary below it
	// — rows, or the unsaved-changes banner. A card whose rows are always empty
	// (write-only credentials) never has that summary, open or closed, so the
	// line would only ever dangle above the open form instead of dividing
	// anything.
	const showPrefaceDivider = rows.length > 0 || dirty
	return (
		// One grid, gap 0: the card and its hint sibling are a single item in the
		// parent's grid, and the hint's own top spacing lives inside its Reveal
		// (clipped by the 0fr track while collapsed) so a closed card leaves no
		// phantom gap below it.
		<styled.div display="grid" gap="0">
			<ContentCard
				title={title}
				subtitle={subtitle}
				aria-label={regionLabel}
				headerGap={hasRestingContent || open ? '5' : '0'}
				action={
					<Button
						type="button"
						variant="outline"
						size="sm"
						aria-expanded={open}
						onClick={wrap(() => setOpen(!open))}
					>
						{open ? <X size={14} /> : <Pencil size={14} />}
						<SwapLabel active={open} on={closeLabel} off={editLabel} />
					</Button>
				}
			>
				{preface && (
					<styled.div
						display="grid"
						gap="4"
						pb="5"
						mb="5"
						borderBottomWidth={showPrefaceDivider ? '1px' : undefined}
						borderColor="border"
					>
						{preface}
					</styled.div>
				)}
				<Reveal open={!open}>
					<styled.div display="grid" gap="4">
						<styled.dl display="grid" gap="3">
							{rows.map((row) => (
								<styled.div
									key={row.key ?? row.label}
									display="grid"
									gridTemplateColumns={{ base: '1fr', sm: 'minmax(0, 220px) 1fr' }}
									gap={{ base: '0.5', sm: '4' }}
									alignItems="baseline"
								>
									<styled.dt textStyle="xs" color="fg.muted">
										{row.label}
									</styled.dt>
									<styled.dd
										textStyle="sm"
										fontWeight="medium"
										color="fg.default"
										wordBreak="break-word"
									>
										{row.value}
									</styled.dd>
								</styled.div>
							))}
						</styled.dl>
						{dirty && (
							<styled.div
								role="status"
								display="flex"
								flexWrap="wrap"
								alignItems="center"
								gap="3"
								bg="orange.subtle.bg"
								color="orange.subtle.fg"
								borderRadius="l2"
								px="3"
								py="2"
							>
								<TriangleAlert size={16} />
								<styled.span textStyle="xs" flex="1" minW="12rem">
									{m.form_unsaved_changes()}
								</styled.span>
								<styled.div display="flex" gap="2">
									<Button
										type="button"
										variant="outline"
										size="xs"
										onClick={wrap(() => setOpen(true))}
									>
										{m.form_unsaved_continue()}
									</Button>
									{onReset && (
										<Button
											type="button"
											variant="plain"
											size="xs"
											colorPalette="red"
											onClick={onReset}
										>
											<Undo2 size={14} />
											{m.form_reset_changes()}
										</Button>
									)}
								</styled.div>
							</styled.div>
						)}
					</styled.div>
				</Reveal>
				<Reveal open={open}>
					<styled.div display="grid" gap="4">
						{children}
					</styled.div>
				</Reveal>
			</ContentCard>
			{hint && (
				// The hint is a sibling below the card, not nested in it — its own
				// Reveal keeps the open/close easing in sync with the form, and the
				// top margin (inside the track, clipped to 0 while collapsed) gives
				// it air without leaving phantom space on a closed card.
				<Reveal open={open}>
					<styled.div pt="4">{hint}</styled.div>
				</Reveal>
			)}
		</styled.div>
	)
}, 'EditableCard')
