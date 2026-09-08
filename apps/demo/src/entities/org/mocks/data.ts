import type { Org } from '#entities/org/model/types'

export const mockOrgs = [
	{ id: 'org-alpha', name: 'Acme Trading' },
	{ id: 'org-beta', name: 'Northwind Logistics' },
] satisfies Org[]
