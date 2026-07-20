---
title: Why React hooks are restricted
date: 2026-06-18
tag: architecture
summary: React renders; Reatom holds the application's reactive state. A lint rule makes that boundary visible by forbidding useState, useEffect, and their relatives so state never scatters back into components.
link: https://github.com/apphane-dev/karkas/blob/main/docs/reatom-patterns.md
linkLabel: See the patterns
example: true
---

> This is an example update, seeded so the feed has something to show. Replace it with a real entry when you publish.

Most React templates leave the state architecture implicit: some data lives in
`useState`, some in context, some in a store, and the boundaries blur as the app
grows. Karkas makes one decision instead. React is the rendering layer; Reatom
owns atoms, actions, computed values, forms, persistence, async lifecycles, and
routing.

To keep that decision from eroding, the oxlint configuration forbids importing
`useState`, `useEffect`, `useMemo`, `useCallback`, `useReducer`, `useContext`,
`useRef`, and `memo`. Reaching for one produces a lint error that points at the
Reatom pattern to use instead — or at asking for guidance when a case is
genuinely new.

The rule is not dogma for its own sake. It is what makes the rest of the system
legible: route loaders get real cancellation, forms get a single reactive model,
and a reader can always tell where state lives without tracing hook call order.
