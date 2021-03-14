import { ProductItem } from '../models/ProductItem'
import { ProductsAccess } from '../dataLayer/ProductsAccess'

import { createLogger } from '../utils/logger'
import { CreateProductRequest } from '../requests/CreateProductRequest'
import { UpdateProductRequest } from '../requests/UpdateProductRequest'



const productsAccess = new ProductsAccess()
const logger = createLogger('Products businessLogic')

/**
 * Get all Products over the dataLayer
 * @returns a json array with the products
 */
export async function getProducts(): Promise<ProductItem[]> {
  logger.info('Get Products')
  return await productsAccess.getProducts()
}

/**
 * Get the Products for the current user over the dataLayer
 * @param userId the user id
 * @returns a json array with the products
 */
export async function getMyProducts(userId: string): Promise<ProductItem[]> {
  logger.info('Get my Products')
  return await productsAccess.getMyProducts(userId)
}

/**
 * Get a Product by its id
 * @param userId the user id
 * @param productId the product id
 * @returns a json object with the product
 */
export async function getProduct(userId: string, productId: string): Promise<ProductItem> {
  logger.info('Get a Product')
  return await productsAccess.getProduct(userId, productId)
}

/**
 * Update a Product for a specific user over the dataLayer
 * @param userId the user id
 * @param productId the product id
 * @param updatedProduct a json object with the fields to be updated
 */
export async function updateProduct(
  userId: string,
  productId: string,
  updatedProduct: UpdateProductRequest
) {
  logger.info('Update Product', {
    userId,
    updatedProduct
  })
  await productsAccess.updateProduct(userId, productId, updatedProduct)
}

/**
 * Create a Product for a specific user over the dataLayer
 * @param userId the user id
 * @param createdProduct a json object representing a new product item
 * @returns a json object with the new product
 */
export async function createProduct(
  userId: string,
  createdProduct: CreateProductRequest
): Promise<ProductItem> {
  logger.info('Create Product', {
    userId,
    createdProduct
  })
  return await productsAccess.createProduct(userId, createdProduct)
}

/**
 * Delete a Product for a specific user over the dataLayer
 * @param userId the user id
 * @param productId the product id
 */
export async function deleteProduct(userId: string, productId: string) {
  logger.info('Delete Product', {
    userId,
    productId
  })
  await productsAccess.deleteProduct(userId, productId)
}

/**
 * Generates an upload Url to attach an image to a product item over the dataLayer
 * @param userId the user id
 * @param productId the product id
 * @returns the upload url
 */
export async function generateUploadUrl(userId: string, productId: string) {
  const uploadUrl = await productsAccess.generateUploadUrl(productId)

  logger.info('GetUploadUrl', {
    uploadUrl
  })

  await productsAccess.updateAttachmentUrl(userId, productId)
  return uploadUrl
}
