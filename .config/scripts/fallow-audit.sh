#!/usr/bin/env bash
# Compare PR changes with the target/default branch, never the feature upstream.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

base="${FALLOW_AUDIT_BASE:-}"
if [[ -z "$base" && -n "${GITHUB_BASE_REF:-}" ]]; then
	base="refs/remotes/origin/${GITHUB_BASE_REF}"
fi

if [[ -z "$base" ]]; then
	for candidate in refs/remotes/origin/HEAD refs/remotes/origin/main refs/remotes/origin/master refs/heads/main refs/heads/master; do
		if git rev-parse --verify --quiet --end-of-options "${candidate}^{commit}" >/dev/null; then
			base="$candidate"
			break
		fi
	done
fi

if [[ -z "$base" ]] || ! git rev-parse --verify --quiet --end-of-options "${base}^{commit}" >/dev/null; then
	printf 'No usable Fallow audit base%s. Fetch the target/default branch or set FALLOW_AUDIT_BASE to an available Git ref.\n' "${base:+ ($base)}" >&2
	exit 2
fi

exec nub exec fallow audit --base "$base" --config .config/fallow.toml --format json --quiet
