# create-karkas

## 0.2.0

### Minor Changes

- a096703: Refresh the generated project for Nub 0.9, Vite+ 1.1, Vitest 5, React 19.3,
  Storybook 10.6, MSW 3, and Panda 2. Include the matching deduplicated lockfile,
  share Vite+ through a Vite override, and remove the unused legacy Panda Studio
  package. Update the Storybook actors and Park UI recipes for the new APIs.
- 4f55fcf: Upgrade `@clack/prompts` to v1.7.0 and require Node.js >= 20.12.0, matching the prompt library's ESM-only major.
- e56953d: Refresh the scaffold's dependency set (storybook ~10.6.0, react 19.2.8, vite 8.2.2, playwright 1.63, lucide-react 1.41, panda 1.12.1, paraglide-js 2.25, nub pin 0.7.5, @types/node 26 for the generator) and ship a `pnpm-lock.yaml` in the template: generated projects now track their lockfile, and the template CI freezes installs against it. Template mise deps sources and CI cache paths point at the shipped lockfile.

### Patch Changes

- 73ff64a: Refresh the generated project for Nub 0.9.7, Vite+ 1.4 with Vitest 5.0.5,
  Storybook 10.6.3, React 19.3.1, Panda 2.4, Paraglide 2.29, steiger 0.8,
  fallow 3.35, and mise-action 5.2.3, with the matching lockfile. The template's
  fallow config ignores the `plugins` key of `postcss.config.cjs`, which fallow
  3.35 reports as an unused export.

## 0.1.0

### Minor Changes

- 30cd68e: Publish the `create-karkas` initializer with a production-ready Karkas application template.
