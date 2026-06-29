import type { RequestHandler } from 'msw'

import { articleDetail, articleList } from '#entities/article/mocks/handlers'
import { authHandlers } from '#entities/auth/mocks/handlers'
import { connectionDetail, connectionList } from '#entities/connection/mocks/handlers'
import {
	conversationDetail,
	conversationList,
	conversationUnreadCount,
} from '#entities/conversation/mocks/handlers'
import { dashboardStats } from '#entities/dashboard/mocks/handlers'
import { itemDetail, itemList } from '#entities/item/mocks/handlers'
import { settingHandlers } from '#entities/setting/mocks/handlers'
import { timelineEventDetail, timelineEventList } from '#entities/timeline-event/mocks/handlers'
import { usageStats } from '#entities/usage/mocks/handlers'

export const handlers = {
	articleList: articleList.default,
	articleDetail: articleDetail.default,
	authLogin: authHandlers.login,
	authLogout: authHandlers.logout,
	connectionList: connectionList.default,
	connectionDetail: connectionDetail.default,
	conversationList: conversationList.default,
	conversationUnreadCount: conversationUnreadCount.default,
	conversationDetail: conversationDetail.default,
	dashboardStats: dashboardStats.default,
	itemList: itemList.default,
	itemDetail: itemDetail.default,
	settings: settingHandlers,
	usageStats: usageStats.default,
	timelineEventList: timelineEventList.default,
	timelineEventDetail: timelineEventDetail.default,
} satisfies Record<string, RequestHandler | RequestHandler[]>

export const handlersArray = Object.values(handlers).flat() satisfies RequestHandler[]
