#!/usr/bin/env bash
# Re-applied after every `apm install` (see lifecycle in apm.yml).
# Strips `disable-model-invocation` so agents can apply these skills
# automatically, matching the machine-wide copies.
set -euo pipefail
for skill in unslop typescript-best-practices; do
  f=".agents/skills/$skill/SKILL.md"
  [ -f "$f" ] && sed -i '/^disable-model-invocation:/d' "$f"
done
