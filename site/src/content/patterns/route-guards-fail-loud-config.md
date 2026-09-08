---
title: Route guards with a fail-loud configuration
tag: routing
problem: >-
  Auth gates sprout wherever pages are declared: the entity that owns the
  session hard-codes where the login page lives, login itself hand-rolls an
  "already authenticated? go home" check, and a bootstrap that forgets to
  install the session before the first navigation silently swallows the
  redirect — the user lands on a guarded page as if nothing were wrong.
decision: >-
  `shared/router` owns guard *structure* — an auth-required layout branch and
  a public-exclusive branch — and defers every concrete decision to callbacks
  in a `routeGuardConfig` atom wired by `App.tsx`, the composition root: what
  counts as authenticated, where an unauthenticated visit goes, where an
  authenticated visit to login goes. Every callback is seeded with a
  fail-loud sentinel, so a bootstrap that forgets to wire a guard throws the
  moment it runs instead of leaking a guarded page.
files:
  - packages/create-karkas/template/src/shared/router/guards.ts
  - packages/create-karkas/template/src/app/App.tsx
  - apps/demo/src/pages/login/model/routes.tsx
demo: /demo/articles
order: 5
---

Pages never import a guard from the entity that owns the session. They attach
to `protectedRoute` (a layout branch — every child page inherits the gate) or
`publicExclusiveRoute` (login), and the guards read everything they need from
one config atom:

```ts
wireRouteGuards({
	isAuthenticated: () => isAuthenticatedAtom(),
	onUnauthenticated: () => {
		if (!loginRoute.match()) loginRoute.go(undefined, true);
	},
	onAuthenticatedExclusive: () => {
		if (!dashboardRoute.match()) dashboardRoute.go(undefined, true);
	},
});
```

Three consequences worth keeping:

**The session predicate is injected too.** `shared/router` never imports the
auth entity — the layering stays one-directional, and swapping the session
implementation never touches the route tree.

**Unwired means loud.** Each callback starts as a sentinel that throws a
"not wired" error naming the callback. The guards evaluate while routes
match, so a missing `wireRouteGuards` call surfaces during the first
navigation — in dev, immediately — rather than as a quietly missing redirect.

**A pathless guard matches every URL — so it must prove ownership before
redirecting.** Both guard branches are pathless children of the root, which
means their `params()` evaluates on public and private pages alike. Each one
checks that the current pathname belongs to a page its own branch registers
before firing its redirect; without that check, the public-exclusive branch
bounces every authenticated navigation back to the dashboard. Idempotence at
the callback (`!targetRoute.match()`) is not a substitute: it tests the
target, not whether this guard owns the URL. The wiring itself runs inside
the app's root frame — the setup clears the ambient Reatom stack, so a bare
top-level call throws.

## See it in the demo

1. Run the demo and open any page — the pages attach to `protectedRoute`, so
   the gate is inherited, not declared per page.
2. Log out from the account menu: the guard hands the navigation to
   `onUnauthenticated` and you land on `/login`.
3. While logged out, point the browser at a deep URL such as
   `/articles/an-article` — the guard redirects to login before the page
   loader runs; after logging in, the flow continues inside the authed
   layout.
4. While logged in, visit `/login` directly: the public-exclusive branch
   bounces you to the dashboard.
5. In the template's tests, `src/shared/router/guards.test.ts` proves the
   unwired-config throw and both redirect hand-offs.
