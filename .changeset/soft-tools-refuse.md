---
"create-karkas": minor
---

Refresh the scaffold's dependency set (storybook ~10.6.0, react 19.2.8, vite 8.2.2, playwright 1.63, lucide-react 1.41, panda 1.12.1, paraglide-js 2.25, nub pin 0.7.5, @types/node 26 for the generator) and ship a `pnpm-lock.yaml` in the template: generated projects now track their lockfile, and the template CI freezes installs against it. Template mise deps sources and CI cache paths point at the shipped lockfile.
