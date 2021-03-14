/**
 * Fields in a request to update a single PRODUCT item.
 */
export interface UpdateProductRequest {
  title: string
  description: string
  price: number
  stock: number
  imageUrl: string
  category: string
}

