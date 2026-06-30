import { HttpResponse, delay, http, type HttpResponseResolver } from 'msw'

import {
	SETTINGS_API_PATH,
	SETTINGS_PROFILE_API_PATH,
	SETTINGS_NOTIFICATIONS_API_PATH,
} from '#entities/setting/api/settingsApi'
import { settingsMockData } from '#entities/setting/mocks/data'
import { composeApiUrl } from '#shared/api'
import { neverResolve, to500, withRetrySuccess } from '#shared/mocks/utils'

const getUrl = composeApiUrl(SETTINGS_API_PATH)
const profileUrl = composeApiUrl(SETTINGS_PROFILE_API_PATH)
const notificationsUrl = composeApiUrl(SETTINGS_NOTIFICATIONS_API_PATH)

const fetchResolver = (async () => {
	await delay()
	return HttpResponse.json(settingsMockData)
}) satisfies HttpResponseResolver

const saveResolver = (async ({ request }) => {
	await delay()
	await request.json()
	return HttpResponse.json({ ok: true })
}) satisfies HttpResponseResolver

export const settingsFetch = {
	default: http.get(getUrl, fetchResolver),
	error: http.get(getUrl, () => to500()),
	retrySucceeds: () => http.get(getUrl, withRetrySuccess(fetchResolver)),
	loading: http.get(getUrl, neverResolve),
}

export const settingsProfile = {
	default: http.post(profileUrl, saveResolver),
	error: http.post(profileUrl, () => to500()),
}

export const settingsNotifications = {
	default: http.post(notificationsUrl, saveResolver),
	error: http.post(notificationsUrl, () => to500()),
}

export const settingHandlers = [
	settingsFetch.default,
	settingsProfile.default,
	settingsNotifications.default,
]
