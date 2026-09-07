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
demo: /demo/login
order: 1
---

Every app with forms hits the same failure modes, and every team re-solves them
worse under deadline. The Karkas template ships the solved versions as Reatom
form extensions — imported from the shared barrel, attached with `.extend()`,
no configuration.

## The rebaseline decision

After a successful save a form must stop reading as dirty without losing what
the user sees. The mechanism is `withSavedState`: the values `onSubmit`
**returns** become the form's new baseline via `init` — not `reset`, which
would clobber anything typed while the request was in flight. Two consequences
fall out of that choice:

- The payload rebaselined is the payload actually persisted. Rebaseline from
  the form's live state instead, and an edit that never reached the server
  reads as saved — the edit is silently lost while the UI says otherwise.
- A write-only form (credentials, one-way secrets) returns nothing from
  `onSubmit`, and `withSavedState` clears it with `reset`. Nothing to read
  back; the secret must not linger.

`reatomForm`'s own `resetOnSubmit` option is deliberately unused: two owners of
the post-save decision disagree with each other. `withSavedState` is the single
owner.

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

The login form wires `withFormSubmitHandler` (native-submit bridging) and
`formAlertMessage` (form-level alert) — the smallest complete usage. To see
the behavior:

1. Open the demo and go to the login page (the "See it in the demo" button
   below leads straight there).
2. Leave the prefilled email, break the password, submit. A form-level alert
   appears under the heading — that is `formAlertMessage` showing a failure
   no field owns. Note what does _not_ happen: no error text appears under
   the email or password fields, because neither field owns this failure.
3. Restore the password (`password`) and submit. The button shows its pending
   state, then the dashboard replaces the page — `withFormSubmitHandler`
   bridged the native form submission, and the session atom's route guard let
   you through.

The rebaseline half of the story (`withSavedState`) shows its value on
settings-style forms and lands with the disclosure-card pattern.
