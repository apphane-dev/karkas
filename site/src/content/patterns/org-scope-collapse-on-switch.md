---
title: Organization scope with a collapse on switch
tag: routing
problem: >-
  Multi-tenant apps grow org gates wherever pages are declared, and the switch
  itself is where it breaks: a deep org-scoped URL (a settings page, an entity
  detail) survives the switch, but the entity behind the path belongs to the
  previous org and 404s under the new one — and route loaders keep their last
  fulfilled payload across a rejection, so the old org's page renders on,
  indefinitely. Per-route "is this still mine?" checks make every future route
  relearn the same lesson.
decision: >-
  The org is a guard branch, not a page concern: a pathless org-required
  layout under the protected route whose async loader fulfills with the
  active org id, invalidating on every org write. A change hook on the
  fulfilled payload — keyed on the guard payload, not the org atom, so boot,
  first selection, and sign-out are never mistaken for a switch — collapses
  deep URLs to the app root when the id changes A to B. The navigation runs
  deferred in its own wrapped action: a URL write from the hooks frame leaks
  unhandled AbortErrors from the superseded child loaders, and navigating
  from the org-write transaction aborts the guard's in-flight rerun into a
  permanently pending loader.
files:
  - packages/create-karkas/template/src/shared/router/guards.ts
  - packages/create-karkas/template/src/entities/org/model/org.ts
  - apps/demo/src/app/OrgSwitcher.tsx
demo: /demo/settings
order: 6
---

The org branch inherits the auth gate and adds asynchronous scope readiness on
top. Pages attach to `orgGuardRoute` instead of `protectedRoute` and three
things come for free:

**Child loaders wait for the scope.** The guard's loader re-runs on every org
write (it reads the injected `currentOrgId` thunk), and any child loader that
awaits the guard refetches with it — the single control point that keeps the
guarded route tree free of the previous org's data.

**A stale payload never paints.** The branch's render gates its outlet on
`guardState.orgId === currentOrgId()`: while the next scope resolves, the
fulfilled payload still names the previous org, and the outlet renders nothing
rather than the wrong org's page. An unsettled payload (first load) renders
children so their own loading state shows.

**A switch collapses the URL — once, after settling.** Deep links keep their
URL on boot (undefined to an id is not a switch), sign-out (id to null) never
collapses, and the pathname check inside the collapse keeps repeated switches
from looping.

```ts
orgGuardRoute.loader.data.extend(
	withChangeHook((state, prevState) => {
		if (!prevState?.orgId || !state?.orgId || prevState.orgId === state.orgId) return;
		// Deferred past the fulfillment transaction: a URL write from the
		// hooks frame leaks unhandled AbortErrors from the child loaders the
		// navigation supersedes, and a bare deferred write loses the async
		// stack. wrap() carries this frame into the microtask.
		queueMicrotask(wrap(collapseToOrgRoot));
	}),
);
```

The concrete decisions stay injected, same as the auth guards: `orgState`
(how to fetch scope readiness), `currentOrgId` (where the active id lives),
`onOrgless` (where an org-less account goes), `onOrgsReady` (resolve a
default org). `shared/router` never imports the org entity.

## See it in the demo

1. Run the demo, sign in, and open `/settings` — the page hangs off the org
   guard, so the gate is inherited and the scope resolves before the page
   loader runs.
2. Open the sidebar's organization switcher and pick the other organization:
   the settings outlet gates immediately, and once the guard settles under
   the new org the URL collapses to the dashboard — the old org's settings
   never render.
3. Reload on `/settings` instead: the deep link keeps its URL — the boot
   resolves a default org, which is not a switch.
