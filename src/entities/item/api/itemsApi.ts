import type { Item } from '#entities/item/model/types'

import { apiClient } from '#shared/api'

export const ITEMS_API_PATH = '/items'

export async function fetchItems() {
	return apiClient.get<Item[]>(ITEMS_API_PATH)
}

export async function fetchItemById(itemId: string) {
	return apiClient.get<Item>(`${ITEMS_API_PATH}/${itemId}`)
}
