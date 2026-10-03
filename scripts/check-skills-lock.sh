#!/usr/bin/env bash
# hk check: keep apm.lock.yaml in sync with apm.yml, and surface
# upstream skill releases. Network required (resolves git refs).
set -euo pipefail

apm install --only apm >/dev/null

if ! git diff --exit-code --quiet -- apm.yml apm.lock.yaml; then
  echo "✗ agent skill manifest/lockfile out of sync —" >&2
  echo "  run 'mise deps install skills' (or 'mise run skills:update') and commit the result:" >&2
  git diff --stat -- apm.yml apm.lock.yaml >&2
  exit 1
fi

# Warn-only: newer upstream tags should not block commits, but should be seen.
if ! out="$(apm outdated 2>/dev/null)"; then
  :
fi
if ! printf '%s' "$out" | grep -q "up-to-date"; then
  echo "⚠ outdated agent skills — consider 'mise run skills:update':" >&2
  printf '%s\n' "$out" | sed 's/^/  /' >&2
fi
