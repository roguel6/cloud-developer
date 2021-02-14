import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'


const logger = createLogger('deleteTodo')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event', {
        event
      })
  const todoId = event.pathParameters.todoId
  const userId = parseUserId(event.headers.Authorization)

  var params = {
    TableName:todosTable,
    Key:{
        "userId": userId,
        "todoId": todoId
    }
  };
  logger.info('Parameter for the delete operation', {
    params
  })

  const result = await docClient.delete(params).promise()
  logger.info('Delete Item succeed', {
    result
  })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ""
  }
}
