import { computed, withAsyncData } from '@reatom/core'

import { fetchUsageData } from '#entities/usage/api/usageApi'

/**
 * Global usage data atom for the sidebar usage summary widget, which renders on
 * every page regardless of the active route. Mirrors the `conversationUnreadCount`
 * pattern: fires a fetch on first read and exposes the result via `withAsyncData`.
 */
export const usageDataAtom = computed(() => fetchUsageData(), 'usageData').extend(withAsyncData())
