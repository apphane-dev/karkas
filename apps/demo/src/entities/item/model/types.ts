export type Category = 'electronics' | 'furniture' | 'clothing' | 'food'

export type Item = {
	id: string
	name: string
	price: number
	category: Category
	inStock: boolean
}
