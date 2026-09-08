---
title: The display/edit card
tag: ui
problem: >-
  Settings and detail pages drift into either extreme: a permanent wall of
  inputs where nothing states its current value, or a read-only view whose
  "Edit" swap hard-cuts to a form that loses the draft when the user sneezes.
  Every card re-solves the toggle, the cancel-vs-close semantics, the dirty
  warning, and the submit button's prominence — and each solves them
  differently.
decision: >-
  One card owns the pattern. Closed, it states the saved values as labelled
  rows; a header toggle swaps the rows for the edit form inside a
  height-animated `Reveal` whose both regions stay mounted — that is what
  lets drafts survive a close. Closing over a dirty form keeps the draft on
  purpose (the toggle says "Close", not "Cancel") and a warning row offers
  the two honest exits: keep editing, or `Reset` back to the saved values.
  The form stays caller content; the submit CTA is quiet while the form is
  clean and promotes to primary the moment a field diverges — engagement,
  not position, signals the primary action.
files:
  - packages/create-karkas/template/src/shared/components/EditableCard.tsx
  - packages/create-karkas/template/src/shared/components/FormActions.tsx
  - apps/demo/src/pages/articles/ui/detail/ArticleDetail.tsx
  - apps/demo/src/pages/articles/model/articleDetailModel.ts
demo: /demo/articles
order: 4
---

The widget owns exactly the chrome every display/edit surface shares — the
disclosure, the read-only rows, the dirty warning, the CTA promotion — and
none of the domain. The form is `children`; the rows are plain data; the
open state is either local or hoisted into a page-level atom when several
cards should behave as an accordion.

## What closing means

`EditableCard`'s contract is deliberate about the one word that usually gets
mangled: the toggle reads **Close**, never **Cancel**. Closing does not
discard anything. If the form is dirty, the closed card shows an
unsaved-changes row with two actions — continue editing (reopens) or Reset
(discards). If the form is clean, the card closes silently, because there is
nothing to warn about.

The `Reveal` under the swap is the reason drafts survive: both regions stay
mounted, so uncontrolled input state persists through any number of
open/close cycles. The 0fr→1fr grid track animates height without layout
hacks, and `visibility`/`overflow` switch on a discrete-property schedule so
the collapsed region leaves the accessibility tree immediately while the
pixels ease.

## The CTA follows the cursor's engagement

`FormCta` reads `form.focus().dirty` and swaps its own variant: outline while
clean, filled while dirty. A quiet Save invites a click on a clean form; a
promoted Save says "your draft differs from the saved values". It stays
actionable either way so submit-time validation can explain an incomplete
draft — only the in-flight loading state blocks duplicate submits.

`FormReset` renders only while dirty and discards the whole draft, with an
`onReset` escape hatch for callers that must also clear derived state.

## See it in the demo

1. Open any article in the demo — the detail is an `EditableCard`: status and
   description as rows, the article body as always-visible preface.
2. Press **Edit**: the rows swap for the form with the height animation; the
   toggle now reads **Close**.
3. Type a new title, then press **Close** without saving: the card closes,
   a warning row states that unsaved changes are kept, and the rows still
   show the saved values.
4. Press **Edit** again — the draft is still in the field (the form never
   unmounted). Press **Reset**: the draft returns to the saved values and
   the warning disappears.
5. Change the title and **Save**: the button was promoted to filled the
   moment you typed; while the request is in flight it shows the loading
   state; when the rows reappear they state the saved title.
6. With a dirty draft, save failures render the inline alert inside the open
   form (`Integration/Articles/Detail → Edit Article Server Error` story).
