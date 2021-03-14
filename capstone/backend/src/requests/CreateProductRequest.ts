/**
 * Fields in a request to create a single PRODUCT item.
 */
export interface CreateProductRequest {
  title: string
  description: string
  price: number
  stock: number
  imageUrl: string
  category: string
}

