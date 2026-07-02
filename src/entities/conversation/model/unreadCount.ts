import { computed, withAsyncData } from '@reatom/core'

import { fetchConversationsUnreadCount } from '#entities/conversation/api/conversationsApi'
import { withRouteAbort } from '#shared/router'

export const conversationUnreadCountAtom = computed(
	async () => await withRouteAbort(fetchConversationsUnreadCount),
	'conversationUnreadCount',
).extend(withAsyncData())
