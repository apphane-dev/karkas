#!/usr/bin/env bash
# Couple agent-skill deps in apm.yml to the npm packages that ship them.
#
#   kahraman      -> apphane-dev/kahraman#v<version>  (release tags match npm)
#   @reatom/core  -> reatom/reatom#v1001              (no per-release tags; the
#                     lockfile pins the branch-head commit and the recorded npm
#                     version in .config/skill-deps.txt forces a re-resolve
#                     whenever the installed npm version moves)
#
# fix mode (default): rewrite refs from node_modules, then `apm install`.
# check mode (--check): fail if refs would change or the lockfile is stale.
set -euo pipefail
cd "$(dirname "$0")/.."
STATE=".config/skill-deps.txt"

MODE="${1:-fix}"
changed=""

require_version() { # <pkg>
	node -p "require('./node_modules/$1/package.json').version" 2>/dev/null ||
		{ echo "✗ $1 not installed — run 'nub install' first" >&2; exit 1; }
}

fail_check() {
	echo "✗ $* — run 'scripts/sync-skills.sh' (or 'mise deps install skills') and commit" >&2
	exit 1
}

sync_tag() { # <pkg> <repo-prefix>
	local pkg="$1" prefix="$2" ver ref
	ver="$(require_version "$pkg")"
	ref="${prefix}#v${ver}"
	if ! grep -qF "$ref" apm.yml; then
		[[ "$MODE" == "--check" ]] &&
			fail_check "$pkg@$ver installed but apm.yml pins $(grep -oF "${prefix}#v[0-9A-Za-z._-]*" apm.yml || echo 'nothing')"
		sed -i "s|${prefix}#v[0-9A-Za-z._-]*|${ref}|" apm.yml
		changed="$changed $pkg"
	fi
}

sync_branch() { # <pkg> <repo-prefix> <branch>
	local pkg="$1" prefix="$2" branch="$3" ver recorded
	ver="$(require_version "$pkg")"
	recorded=""
	if [ -f "$STATE" ]; then
		recorded="$(sed -n "s|^${pkg}=||p" "$STATE" | tail -1)"
	fi
	if [[ "$recorded" != "$ver" ]]; then
		[[ "$MODE" == "--check" ]] &&
			fail_check "$pkg@$ver installed but apm.yml was resolved for ${recorded:-<unknown>}"
			sed -i "s|${prefix}#[0-9A-Za-z._-]*|${prefix}#${branch}|" apm.yml
		if grep -q "^${pkg}=" "$STATE" 2>/dev/null; then
			sed -i "s|^${pkg}=.*|${pkg}=${ver}|" "$STATE"
		else
			echo "${pkg}=${ver}" >> "$STATE"
		fi
		changed="$changed $pkg"
	fi
}

sync_tag kahraman apphane-dev/kahraman
sync_branch @reatom/core reatom/reatom v1001

if [[ "$MODE" == "--check" ]]; then
	if ! git diff --exit-code --quiet -- apm.yml apm.lock.yaml; then
		fail_check "uncommitted changes in apm.yml/apm.lock.yaml"
	fi
	hold="$(mktemp)"
	cp apm.lock.yaml "$hold"
	apm install --only apm >/dev/null
	if ! diff -q "$hold" apm.lock.yaml >/dev/null; then
		echo "✗ lockfile out of sync with apm.yml — re-materialized in the working tree; commit the changes" >&2
		git diff --stat -- apm.lock.yaml >&2
		exit 1
	fi
	rm -f "$hold"
	exit 0
fi

[[ -n "$changed" ]] && echo "skill deps synced from npm:$changed"
apm install --only apm
