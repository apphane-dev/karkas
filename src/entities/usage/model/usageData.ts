import { abortVar, computed, withAsyncData, wrap } from '@reatom/core'

import { fetchUsageData } from '#entities/usage/api/usageApi'

/**
 * Global usage data atom for the sidebar usage summary widget, which renders on
 * every page regardless of the active route. Mirrors the `conversationUnreadCount`
 * pattern: fires a fetch on first read and exposes the result via `withAsyncData`.
 *
 * The `/usage` route loader runs its own abortable fetch (so it can abort on
 * navigation and surface retry/error). These two queries intentionally stay
 * independent — the route never seeds this atom's `.data` manually, which would
 * race a concurrent fetch here.
 */
export const usageDataAtom = computed(
	async () => await wrap(fetchUsageData({ signal: abortVar.require().signal })),
	'usageData',
).extend(withAsyncData())
