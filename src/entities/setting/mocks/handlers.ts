import { HttpResponse, delay, http, type HttpResponseResolver } from 'msw'

import { composeApiUrl } from '#shared/api'

import { SETTINGS_PROFILE_API_PATH } from '../api/settingsApi'

const updateProfileUrl = composeApiUrl(SETTINGS_PROFILE_API_PATH)

const updateProfileResolver = (async () => {
	await delay()

	return HttpResponse.json({ ok: true })
}) satisfies HttpResponseResolver

export const settingHandlers = [http.patch(updateProfileUrl, updateProfileResolver)]
