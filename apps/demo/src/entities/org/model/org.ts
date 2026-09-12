import { action, atom, computed, withAsyncData } from '@reatom/core'

import { fetchOrgs } from '#entities/org/api/orgApi'

// Session-scoped on purpose: the active org is not persisted, so a reload
// boots unscoped and the guard's ready hook resolves the first org — the same
// flow a fresh sign-in takes. Keying the route collapse on the guard payload
// (not this atom) is what keeps boot from looking like a switch; persisting
// the id would trade that for stale-org deep links that outlive a membership
// change.
export const currentOrgIdAtom = atom<string | null>(null, 'currentOrgId')

// Fires on first read and caches; the org guard's loader awaits it through the
// wired `orgState` callback on every scope change.
export const orgsAtom = computed(() => fetchOrgs(), 'orgsAtom').extend(withAsyncData())

// The org the app acts as right now: the selected id, else the first org —
// which is how an account that booted without an explicit selection still
// resolves one.
export const currentOrgAtom = computed(() => {
	const orgs = orgsAtom.data() ?? []
	const currentOrgId = currentOrgIdAtom()
	return orgs.find(({ id }) => id === currentOrgId) ?? orgs[0] ?? null
}, 'currentOrg')

// Wired as the guard's `onOrgsReady`: fires once the org list is ready and
// non-empty, giving an account that booted without a selection its default org.
export const resolveCurrentOrgAction = action(() => {
	const currentOrg = currentOrgAtom()
	if (currentOrg) currentOrgIdAtom.set(currentOrg.id)
	return currentOrg
}, 'resolveCurrentOrgAction')
