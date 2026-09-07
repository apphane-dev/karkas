---
title: Form save semantics
tag: forms
problem: >-
  A form that just saved still claims there is work left: the submit button stays
  primed, the unsaved-changes warning stays up, and an edit typed while the
  request was in flight gets adopted as "saved" even though it never reached the
  server. Naive post-save handling — reset the form, or reset and re-set the
  values — produces exactly these lies.
decision: >-
  What `onSubmit` returns decides the post-save state: a returned payload
  rebaselines the form (`init`, not `reset`) so in-flight edits survive and stay
  dirty, and returning nothing clears the form — one place owns the decision.
files:
  - packages/create-karkas/template/src/shared/reatom/forms.ts
  - apps/demo/src/shared/reatom/forms.ts
  - apps/demo/src/pages/login/model/routes.tsx
  - apps/demo/src/pages/login/ui/LoginPage.tsx
demo: /demo/login
order: 1
---

Every app with forms hits the same failure modes, and every team re-solves them
worse under deadline. The Karkas template ships the solved versions as Reatom
form extensions — imported from the shared barrel, attached with `.extend()`,
no configuration.

## Two form lifecycles — and why only one needs post-save state

**Navigate-away forms** (login is the canonical case): a successful submit
unmounts the form — the authed route guard redirects, the page is gone. There
is no post-save state to own, so `withSavedState` is deliberately **not**
applied here; adding it would be ceremony. What this lifecycle must get right
is the _failure_ path, because a failed submit leaves the user on the form:

- Field validation errors live under their fields (`visibleFieldError`,
  rendered through Ark UI's `Field.ErrorText`), and the first invalid field is
  focused after a rejected submit (`withFormAutoFocusOnError`).
- The form-level alert shows **only** when no field owns the failure — a
  server rejection like "invalid credentials". Empty fields therefore produce
  no alert; wrong credentials do. That split is the alert-gating decision
  made visible.

**Stay-on-screen forms** (settings, profiles, any inline edit): a successful
submit leaves the form on screen, and now the post-save question is
everything. The form must stop reading as dirty — without adopting edits the
user typed while the request was in flight. That is `withSavedState`: the
values `onSubmit` **returns** become the new baseline via `init` — not
`reset`, which would clobber in-flight edits. Two consequences fall out:

- The payload rebaselined is the payload actually persisted. Rebaseline from
  the form's live state instead, and an edit that never reached the server
  reads as saved — the edit is silently lost while the UI says otherwise.
- A write-only form (credentials, one-way secrets) returns nothing from
  `onSubmit`, and `withSavedState` clears it with `reset`. Nothing to read
  back; the secret must not linger.

The rule in one line: if the route leaves on success, you don't need
post-save ownership; if the form stays, `withSavedState` owns it — do not
hand-roll `init` calls next to it.

`reatomForm`'s own `resetOnSubmit` option is deliberately unused: two owners
of the post-save decision disagree with each other. `withSavedState` is the
single owner.

## Failures no field can carry

A network error or a server-side rejection has no field to live under.
`formAlertMessage(form)` decides when a form-level alert may show: never while
a field validation failure explains the same rejection (the alert would print
the same sentence twice), and never for a submit error a caller has mapped
elsewhere (pass an `isHandled` predicate) — mapped errors outlive the field
errors they produced, and the stale text must not migrate into the alert.

## Errors that leave when the user fixes the value

`visibleFieldError(field)` reads the field's `triggered` flag alongside its
error. With `keepErrorOnChange: false` Reatom keeps the last issue for
bookkeeping but drops `triggered` — reading only `validation.error` leaves
stale copy on screen while the user fixes the value.

## See it in the demo

The login form is wired end-to-end — both failure kinds and the navigate-away
success. To reproduce:

1. Open the demo and go to the login page (the "See it in the demo" button
   below leads straight there).
2. Clear the password and submit. "Password is required" appears **under the
   field**, the field is focused, and **no form-level alert appears** — a
   field owns this failure, so the alert stays out. This is the alert-gating
   split, observable.
3. Restore the password (`password`), clear the email's `@`, and submit. Now
   the fields' own errors explain themselves — still no alert.
4. Fix the email but use a wrong password (`wrong-password`). The form-level
   alert appears: the server rejected the request and no field owns that
   failure. This is `formAlertMessage` letting an unowned failure through.
5. Submit `alex@example.com` / `password`. Pending state, then the dashboard
   replaces the page — success navigates away, which is exactly why this form
   carries no post-save state handling.

The rebaseline half of the story (`withSavedState` on a form that stays on
screen) is exercised by the settings pattern; its demo wiring lands with the
settings-form port.
