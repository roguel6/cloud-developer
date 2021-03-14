import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { ProductItem } from '../models/ProductItem'
import * as uuid from 'uuid'
import { CreateProductRequest } from '../requests/CreateProductRequest'
import { UpdateProductRequest } from '../requests/UpdateProductRequest'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('ProductsAccess')
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class ProductsAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly productsTable = process.env.PRODUCTS_TABLE,
    private readonly indexName = process.env.PRODUCTS_TABLE_SEC_INDEX
  ) {}

  /**
   * Get all products
   * @returns a json array with the products
   */
  async getProducts(): Promise<ProductItem[]> {
    const scanParams = {
        TableName: this.productsTable,
        Limit: 100
      }

    logger.info('Querying the database with params:', {
      scanParams
    })

    try {
      const result = await this.docClient.scan(scanParams).promise()
      logger.info('Result:', {
        result
      })
      const items = result.Items
      return items as ProductItem[]
    } catch (e) {
      logger.info('Error scanning the db:', {
        e
      })
    }
  }

   /**
   * Get a product by id
   * @param userId the user id
   * @param productId the product id
   * @returns a json object with the product
   */
  async getProduct(userId: string, productId: string): Promise<ProductItem> {
    const queryParams = {
      TableName: this.productsTable,
      Key:{
        "userId": userId,
        "productId": productId
      }
    }

    logger.info('Querying the database with params:', {
      queryParams
    })

    try {
      const result = await this.docClient.get(queryParams).promise()
      logger.info('Result:', {
        result
      })
      const item = result.Item
      return item as ProductItem
    } catch (e) {
      logger.info('Error scanning the db:', {
        e
      })
    }
  }


    /**
   * Get products for a specific user
   * @param userId the user id
   * @returns a json array with the products
   */
  async getMyProducts(userId: string): Promise<ProductItem[]> {
    const queryParams = {
      TableName: this.productsTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    logger.info('Querying the database with params:', {
      queryParams
    })

    try {
      const result = await this.docClient.query(queryParams).promise()
      logger.info('Result:', {
        result
      })
      const items = result.Items
      return items as ProductItem[]
    } catch (e) {
      logger.info('Error scanning the db:', {
        e
      })
    }
  }



  /**
   * Update a Product for a specific user
   * @param userId the user id
   * @param productId the product id
   * @param updatedProduct a json object with the fields to be updated
   */
  async updateProduct(
    userId: string,
    productId: string,
    updatedProduct: UpdateProductRequest
  ) {
    var params = {
      TableName: this.productsTable,
      Key: {
        userId: userId,
        productId: productId
      },
      UpdateExpression: 'set title = :t, description=:d, price=:p, stock=:s, imageUrl=:i, category=:c',
      ExpressionAttributeValues: {
        ':t': updatedProduct.title,
        ':d': updatedProduct.description,
        ':p': updatedProduct.price,
        ':s': updatedProduct.stock,
        ':i': updatedProduct.imageUrl,
        ':c': updatedProduct.category
      },
      ReturnValues: 'UPDATED_NEW'
    }
    logger.info('Parameter for the update operation', {
      params
    })

    const result = await this.docClient.update(params).promise()
    logger.info('Update Item succeed', {
      result
    })
  }

  /**
   * Create a Product for a specific user
   * @param userId the user id
   * @param productRequest a json object representing a new product item
   * @returns a json object with the new product
   */
  async createProduct (
    userId: string,
    productRequest: CreateProductRequest
  ): Promise<ProductItem> {
    const itemId = uuid.v4()
    const newProduct: ProductItem = {
      productId: itemId,
      userId: userId,
      createdAt: new Date().toISOString(),
      ...productRequest
    }

    logger.info('New Product object', {
      newProduct
    })

    const result = await this.docClient
      .put({
        TableName: this.productsTable,
        Item: newProduct
      })
      .promise()

    logger.info('Create Item succeed', {
      result
    })

    return newProduct
  }

  /**
   * Delete a Product for a specific user
   * @param userId the user id
   * @param productId the product id
   */
  async deleteProduct(userId: string, productId: string) {
    var params = {
      TableName: this.productsTable,
      Key: {
        userId: userId,
        productId: productId
      }
    }
    logger.info('Parameter for the delete operation', {
      params
    })

    const result = await this.docClient.delete(params).promise()
    logger.info('Delete Item succeed', {
      result
    })
  }

  /**
   * Generates an upload Url to attach an image to a product item
   * @param userId the user id
   * @param productId the product id
   * @returns the upload url
   */
  async generateUploadUrl(productId: string) {
    return  s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: productId,
      Expires: urlExpiration
    })

  }

  /**
   * Updates the image url for a specific product
   * @param userId the user id
   * @param productId the product id
   */
  async updateAttachmentUrl(userId: string, productId: string) {
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${productId}`
    var params = {
      TableName: this.productsTable,
      Key: {
        userId: userId,
        productId: productId
      },
      UpdateExpression: 'set imageUrl = :au',
      ExpressionAttributeValues: {
        ':au': attachmentUrl
      },
      ReturnValues: 'UPDATED_NEW'
    }
    logger.info('Parameter for the update operation', {
      params
    })

    const result = await this.docClient.update(params).promise()
    logger.info('Update Item succeed', {
      result
    })
  }
}

/**
 * Creates a DynamoDB Client
 * @returns the dynamodb client
 */
function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}
