/**
 * Lamba function to create a new product
 */


import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import { CreateProductRequest } from '../../requests/CreateProductRequest'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'
import { createProduct } from '../../businessLogic/products'

const logger = createLogger('createProduct')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event', {
    event
  })

  const userId = parseUserId(event.headers.Authorization)

  try {
    const productRequest:CreateProductRequest = JSON.parse(event.body)
    const newProduct = await createProduct(userId, productRequest)
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: newProduct
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error })
    }
  }
}
