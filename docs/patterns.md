# Patterns

This doc follows the source-first approach in `docs/README.md`.

## Overview

The template ships solved problems, not just scaffolding: mechanisms proven in
production, each carrying the decision that makes it correct. Every pattern is
demonstrated in the running demo app — code without a demo is a snippet, and
snippets rot. Long-form narratives live on the site (`site/src/content/patterns/`);
this doc is the terse index. The comments at the decision points in the source
files are the ground truth.

For general Reatom usage conventions, see `docs/reatom-patterns.md`; for
extension-point mechanics, `docs/reatom-extensions.md`.

## Read Source First

| Pattern                   | The decision                                                                                                          | Template (shipped)                                           | Demo (proves it)                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| Form save semantics       | What `onSubmit` returns owns the post-save state: a returned payload rebaselines, nothing resets.                     | `packages/create-karkas/template/src/shared/reatom/forms.ts` | `apps/demo/src/pages/login/model/routes.tsx` |
| Form-level alert gating   | An alert shows only failures no field owns; a mapped stale error can never migrate into it.                           | `formAlertMessage` in `…/shared/reatom/forms.ts`             | `apps/demo/src/pages/login/ui/LoginPage.tsx` |
| Visible field errors      | The error reads `triggered`, not just `error`, so stale copy leaves when the user fixes the value.                    | `visibleFieldError` in `…/shared/reatom/forms.ts`            | `apps/demo/src/pages/login/ui/LoginPage.tsx` |
| Server validation mapping | A server error is the only one a field cannot re-check: it maps onto fields by name suffix and dies on the next edit. | `src/shared/api/validation.ts`, `errors.ts`                  | `apps/demo/src/pages/login/model/routes.tsx` |
| Web-storage persistence   | The storage is captured by a late-bound factory so tests can stub it first; reads validate the record shape and expiry, never trusting what a previous version wrote. | `src/shared/model/persist.ts`                                | `apps/demo/src/shared/model/featureToggles.ts` |
| Feature toggles           | Names are declared as literal tuples and every read coerces, so an unknown persisted flag degrades to `false` instead of leaking into the UI. | `src/shared/model/featureToggles.ts`, `…/widgets/app-shell/ui/FeatureTogglePanel.tsx` | `apps/demo/src/widgets/app-shell` (panel), `apps/demo/src/pages/articles` (gates) |
| Display/edit card         | Closing keeps the draft mounted — close is not cancel — and only a successful save rebaselines; dirty state warns before discarding. | `src/shared/components/EditableCard.tsx`, `FormActions.tsx`  | `apps/demo/src/pages/articles/ui/detail/ArticleDetail.tsx` |
| Route guards              | Guard routes encode structure only; who is authenticated and where each redirect goes are callbacks wired at the composition root, each failing loud until wired. | `src/shared/router/guards.ts`, `src/app/App.tsx`             | `apps/demo/src/app/App.tsx`, `apps/demo/src/pages/login/model/routes.tsx` |
| Org scope with collapse on switch | The org is a guard branch whose loader fulfills with the active org id; a change hook on the payload collapses deep org-scoped URLs when the id changes A to B — deferred past the fulfillment transaction. | `src/shared/router/guards.ts`, `src/entities/org/model/org.ts` | `apps/demo/src/app/OrgSwitcher.tsx`, `apps/demo/src/pages/settings/model/routes.tsx` |
| Mock state with a reset contract | Mutable mock state is a registered store with a seed provider, deep-cloned items, and no Reatom reactivity; the Storybook preview drains the registry before every story — the drain is the isolation contract, not referer keying. | `src/shared/mocks/store.ts` | `apps/demo/src/entities/article/mocks/handlers.ts`, `apps/demo/.storybook/preview.tsx` |

## Rules

- Every pattern in this catalog lives in the template AND is wired into at
  least one real demo page, widget, or story. An export nothing in the demo
  uses does not count as shipped.
- The reasoning lives in comments at the decision points in the code. A reader
  must be able to tell what breaks if they "simplify" each non-obvious part.
- Candidate evaluation and the production-source workflow are tracked in
  `.pi/prompts/migrate-reatom-patterns.candidates.md`.
- Publishing a new pattern entry on the site is part of shipping the pattern,
  not an afterthought: add `site/src/content/patterns/<slug>.md` with problem,
  decision, file pointers, a demo link, and a "See it in the demo" section
  with step-by-step instructions for reproducing the behavior.

## Workflows

### Adopting a pattern in a generated project

1. Find the mechanism in your project's `src/shared/reatom/` (or the layer the
   catalog above names) — generated projects ship the same files as the
   template.
2. Read the comments at the decision points before using the API; the naive
   alternative is usually documented there with the reason it fails.
3. Mirror the demo wiring (`apps/demo` in the karkas repository) for your
   equivalent page.

### Adding a new pattern

Follow the protocol in
`.pi/prompts/migrate-reatom-patterns.candidates.md`: read the production
source fully, abstract per the methodology, land code + tests + demo wiring +
site entry, run the full quality gate, record status in the candidates file.

## Edge Cases

- A pattern may exist in the template before its richest demo exists (for
  example `withSavedState` before a settings page ships) — the demo link in
  the site entry must still point at wiring that exists, never at a plan.
- If the template and demo copies of a shared file diverge, that is a bug: fix
  it before building on either.
