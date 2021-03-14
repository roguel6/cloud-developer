/**
 * Lamba function to update a product
 */


import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import {APIGatewayProxyEvent,APIGatewayProxyHandler,APIGatewayProxyResult} from 'aws-lambda'
import { UpdateProductRequest } from '../../requests/UpdateProductRequest'
import { parseUserId } from '../../auth/utils'
import { updateProduct } from '../../businessLogic/products'


const logger = createLogger('updateProduct')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event', {
    event
  })
  const updatedProduct: UpdateProductRequest = JSON.parse(event.body)
  const userId = parseUserId(event.headers.Authorization)
  const productId = event.pathParameters.productId

  try {
    await updateProduct(userId, productId, updatedProduct)
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ""
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({"error": error})
    }
  }
  
}
