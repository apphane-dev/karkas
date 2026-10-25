---
"create-karkas": patch
---

Refresh the generated project for Nub 0.9.7, Vite+ 1.4 with Vitest 5.0.5,
Storybook 10.6.3, React 19.3.1, Panda 2.4, Paraglide 2.29, steiger 0.8,
fallow 3.35, and mise-action 5.2.3, with the matching lockfile. The template's
fallow config ignores the `plugins` key of `postcss.config.cjs`, which fallow
3.35 reports as an unused export.
