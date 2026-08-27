---
"@karkas/demo": patch
---

changelog-driven upgrades: kahraman 0.3.0 -> 0.3.1 (@changesets/cli 3.0.1 tooling sync), storybook 10.5.8 -> 10.5.10 (@storybook/react-vite 10.5.10 peer of kahraman 0.3.1). @ark-ui/react held at 5.38.1: 5.39.0 breaks CollectionSelect onValueChange in the demo (Items filter regression, 2 test failures) — retried when ark-ui ships a fix.
