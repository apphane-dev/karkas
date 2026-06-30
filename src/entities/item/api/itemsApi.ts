import type { Item } from '#entities/item/model/types'

import { apiClient } from '#shared/api'

export const ITEMS_API_PATH = '/items'

export async function fetchItems(options?: Pick<RequestInit, 'signal'>) {
	return apiClient.get<Item[]>(ITEMS_API_PATH, options)
}

export async function fetchItemById(itemId: string, options?: Pick<RequestInit, 'signal'>) {
	return apiClient.get<Item>(`${ITEMS_API_PATH}/${itemId}`, options)
}
