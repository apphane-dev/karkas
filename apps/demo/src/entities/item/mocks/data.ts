import type { Item } from '#entities/item/model/types'

export const itemsMockData = [
	{ id: '1', name: 'Wireless Headphones', price: 79.99, category: 'electronics', inStock: true },
	{ id: '2', name: 'Standing Desk', price: 449, category: 'furniture', inStock: true },
	{ id: '3', name: 'Merino Wool Sweater', price: 89.5, category: 'clothing', inStock: false },
	{ id: '4', name: 'Mechanical Keyboard', price: 149.99, category: 'electronics', inStock: true },
	{ id: '5', name: 'Organic Coffee Beans', price: 18.99, category: 'food', inStock: true },
	{ id: '6', name: 'Ergonomic Chair', price: 599, category: 'furniture', inStock: false },
	{ id: '7', name: 'USB-C Hub', price: 45, category: 'electronics', inStock: true },
	{ id: '8', name: 'Linen Shirt', price: 65, category: 'clothing', inStock: true },
	{ id: '9', name: 'Desk Lamp', price: 35.99, category: 'furniture', inStock: true },
	{ id: '10', name: 'Dark Chocolate Bar', price: 6.5, category: 'food', inStock: true },
	{ id: '11', name: 'Running Shoes', price: 129.99, category: 'clothing', inStock: true },
	{ id: '12', name: 'Matcha Powder', price: 24.99, category: 'food', inStock: false },
] satisfies Item[]
