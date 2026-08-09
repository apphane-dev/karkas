import { computed, withAsyncData } from '@reatom/core'

import { fetchConversationsUnreadCount } from '#entities/conversation/api/conversationsApi'

export const conversationUnreadCountAtom = computed(
	() => fetchConversationsUnreadCount(),
	'conversationUnreadCount',
).extend(withAsyncData())
