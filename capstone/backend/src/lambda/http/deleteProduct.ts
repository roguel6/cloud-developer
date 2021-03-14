/**
 * Lamba function to delete a product
 */


import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { parseUserId } from '../../auth/utils'
import { deleteProduct } from '../../businessLogic/products'

const logger = createLogger('deleteProduct')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event', {
    event
  })
  const productId = event.pathParameters.productId
  const userId = parseUserId(event.headers.Authorization)

  try {
    await deleteProduct(userId, productId)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
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
