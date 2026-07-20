---
title: One atomic artifact on Cloudflare Pages
date: 2026-07-04
tag: deployment
summary: The demo and Storybook now ship as a single static artifact built on every push to main, with Wrangler run from an isolated cache so it never disturbs the Nub-only dependency model.
link: https://github.com/apphane-dev/karkas/blob/main/.github/workflows/deploy.yml
linkLabel: Read the deploy workflow
example: true
---

> This is an example update, seeded so the feed has something to show. Replace it with a real entry when you publish.

Karkas deploys as one static directory rather than a set of loosely related
uploads. A GitHub Actions workflow installs dependencies with `nub ci`, runs
`mise run build:cf-pages`, and hands the assembled output to Cloudflare Pages
through Wrangler.

The interesting constraint is the install model. Karkas uses Nub with a
deny-by-default dependency-script policy, and the official Wrangler action
insists on its own project-local npm install. Rather than weaken the policy, the
workflow fetches Wrangler into an isolated npm cache and deploys from there — so
the tool that publishes the site can never quietly change what the site depends
on.

The payoff is that landing copy, the demo's behavior, and Storybook's states can
never drift apart across branches or environments. One reviewed change to `main`
produces one public result.
