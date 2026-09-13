import { HttpResponse, delay, http } from 'msw'

import { ORGS_API_PATH } from '#entities/org/api/orgApi'
import { composeApiUrl } from '#shared/api'
import { to500 } from '#shared/mocks/utils'

import { mockOrgs } from './data'

const orgsUrl = composeApiUrl(ORGS_API_PATH)

export const orgHandlers = {
	orgs: http.get(orgsUrl, async () => {
		await delay()
		return HttpResponse.json(mockOrgs)
	}),
	orgsError: http.get(orgsUrl, () => to500()),
}
