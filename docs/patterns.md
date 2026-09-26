# Patterns

This doc follows the source-first approach in `docs/README.md`.

## Overview

The template ships mechanisms taken from production apps, each with the
decision that makes it correct. Every pattern has a working demo in
`apps/demo`. The long-form write-ups live on the site
(`site/src/content/patterns/`). This doc is the short index, and the comments
at the decision points in the source are the ground truth.

For general Reatom conventions, see `docs/reatom-patterns.md`. For
extension-point mechanics, see `docs/reatom-extensions.md`.

## Read Source First

| Pattern                   | The decision                                                                                                          | Template (shipped)                                           | Demo (proves it)                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Form save semantics       | What `onSubmit` returns owns the post-save state: a returned payload becomes the baseline, nothing resets the form.   | `packages/create-karkas/template/src/shared/reatom/forms.ts` | `apps/demo/src/pages/settings/model/settingsForm.ts`, `…/articles/model/articleDetailModel.ts`            |
| Form-level alert gating   | The alert shows only failures no field owns, and a mapped request error never reappears in it.                        | `formAlertMessage` in `…/shared/reatom/forms.ts`             | `apps/demo/src/pages/login/ui/LoginPage.tsx`                                                              |
| Visible field errors      | The error reads `triggered` as well as `error`, so the old message clears while the user fixes the value.             | `visibleFieldError` in `…/shared/reatom/forms.ts`            | `apps/demo/src/pages/login/ui/LoginPage.tsx`                                                              |
| Server validation mapping | A field cannot re-check a server error, so 422 issues map onto fields by name suffix and clear on the next edit.      | `src/shared/api/validation.ts`, `errors.ts`                  | `apps/demo/src/pages/login/model/routes.tsx`                                                              |
| Server states             | Each entity exports named MSW scenarios (`loading`, `error`, `retrySucceeds()`) that a story opts into with one call. | `src/shared/mocks/utils.ts`                                  | `apps/demo/src/entities/article/mocks/handlers.ts`, `…/app/integration/Articles.list-request.stories.tsx` |

## Rules

- Every pattern in this catalog lives in the template and runs in at least
  one demo page, widget, or story. An export the demo never uses does not
  count as shipped.
- The reasoning lives in comments at the decision points in the code. A
  reader must be able to tell what breaks if they simplify each non-obvious
  part.
- Shipping a pattern includes its site entry:
  `site/src/content/patterns/<slug>.md` with the problem, the decision, file
  pointers, a demo link, and a "See it in the demo" section with steps that
  reproduce the behavior.

## Workflows

### Adopting a pattern in a generated project

1. Find the mechanism in the layer the table names, usually
   `src/shared/reatom/`. Generated projects ship the same files as the
   template.
2. Read the comments at the decision points before using the API. They
   usually name the obvious alternative and why it fails.
3. Copy the demo wiring (`apps/demo` in the karkas repository) for your
   equivalent page.

### Adding a new pattern

1. Read the production source in full before abstracting it.
2. Land the code in both the template and the demo, with tests and demo
   wiring.
3. Add the site entry, then run the full quality gate (`mise run ci`).

## Edge Cases

- A pattern can land in the template before its best demo exists. The demo
  link in the site entry must still point at wiring that exists today.
- If the template and demo copies of a shared file diverge, that is a bug.
  Fix it before building on either copy.
