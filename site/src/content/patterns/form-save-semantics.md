---
title: Form save semantics
tag: forms
problem: >-
  A form that just saved still claims there is work left. The submit button
  stays primed, the unsaved-changes warning stays up, and an edit typed while
  the request was in flight counts as saved even though the server never got
  it. Resetting the form after a save, or resetting and re-setting its values,
  causes all three.
decision: >-
  What `onSubmit` returns decides the post-save state. A returned payload
  becomes the new baseline through `init`, not `reset`, so edits typed during
  the request survive and stay dirty. Returning nothing clears the form.
files:
  - packages/create-karkas/template/src/shared/reatom/forms.ts
  - apps/demo/src/shared/reatom/forms.ts
  - apps/demo/src/pages/login/model/routes.tsx
  - apps/demo/src/pages/login/ui/LoginPage.tsx
  - apps/demo/src/pages/settings/model/settingsForm.ts
  - apps/demo/src/pages/articles/model/articleDetailModel.ts
demo: /demo/login
order: 1
---

The template ships these as Reatom form extensions in `shared/reatom/forms.ts`.
Import them from the shared barrel and attach them with `.extend()`. None of
them take configuration beyond an optional callback.

## Forms that leave on success, and forms that stay

A login form leaves on success. The route guard redirects and the form
unmounts, so there is no post-save state to manage and `withSavedState` is
not applied. The failure path is what matters, because a failed submit keeps
the user on the form:

- Field validation errors render under their fields (`visibleFieldError`
  through Ark UI's `Field.ErrorText`). After a rejected submit,
  `withFormAutoFocusOnError` focuses the first invalid field.
- The form-level alert shows only when no field owns the failure, such as a
  server answer of "invalid credentials". Empty fields produce no alert.
  Wrong credentials do.

A settings section or an inline edit stays on screen after it saves, and it
has to stop reading as dirty without swallowing edits typed during the
request. `withSavedState` handles that. The values `onSubmit` returns become
the new baseline through `init`. `reset` would overwrite the in-flight edits.

- Rebaseline on the payload the server accepted, never on the form's live
  state. Live state includes edits the server never saw, and the UI would
  report them as saved.
- A write-only form (a password change, an API secret) returns nothing from
  `onSubmit`. `withSavedState` then clears it with `reset`, so the secret
  does not stay in memory.

If the route leaves on success, skip `withSavedState`. If the form stays, use
it and do not call `init` next to it by hand. The form's own `resetOnSubmit`
option stays off, because it would make a second, conflicting decision about
post-save state.

## Failures no field can carry

A network error or a record-level server rejection has no field to render
under. `formAlertMessage(form)` decides whether the form-level alert shows.
It returns `null` while a field validation failure explains the rejection,
so the same sentence never prints twice. It also returns `null` for an error
the caller mapped somewhere else, through an `isHandled` predicate. A mapped
request error outlives the field errors it produced, and without the
predicate its text would reappear in the alert after the user edits the
field.

## Server validation renders under fields

`applyApiValidationToFields` maps each issue in a 422 onto a form field by
name suffix, so `body.email` lands on `email`. A field cannot re-check a
server error by itself, so the mapping sets `keepErrorOnChange: false` on
that field. The next keystroke drops the error, and the server judges the
new value on the next submit. Issues that match no field come back to the
caller, and the login model keeps them so the alert can show them.

## Errors clear while the user fixes the value

`visibleFieldError(field)` checks the field's `triggered` flag as well as its
error. With `keepErrorOnChange: false`, Reatom keeps the last issue but
clears `triggered` on change. Reading `validation.error` alone would leave
the old message on screen while the user types the fix.

## See it in the demo

Login covers the failure path. The "See it in the demo" button below opens
the login page.

1. Clear the password and submit. "Password is required" appears under the
   field, the field takes focus, and no form-level alert appears.
2. Enter `password` again, remove the `@` from the email, and submit. The
   email field shows its own error. Still no alert.
3. Fix the email and submit with the password `wrong-password`. The
   form-level alert appears, because the server rejected the request and no
   field owns that failure.
4. Set the email to `taken@example.com` with the password `password` and
   submit. The server answers 422, and "This email is already registered"
   appears under the email field with no alert. Edit the email and the error
   goes away until the next submit.
5. Submit `alex@example.com` with `password`. The button shows its pending
   state, then the dashboard replaces the page.

Settings and article editing cover the stay-on-screen path.

1. Open Settings, change the display name, and click "Save changes". The
   button disappears once the save lands, and the field keeps the new name.
2. Open an article and click "Edit". Change the title and save. The card
   collapses to its summary, which now shows the new title.
