export interface ProductItem {
  productId: string
  userId: string
  createdAt: string
  title: string
  description?: string
  price: number
  stock: number
  imageUrl?: string
  category: string
}