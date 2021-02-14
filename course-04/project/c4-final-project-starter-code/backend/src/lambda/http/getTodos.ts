import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'


const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const indexName = process.env.TODOS_TABLE_SEC_INDEX

const logger = createLogger('getTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event', {
    event
  })
  const userId = parseUserId(event.headers.Authorization)

  logger.info('Reading userId from jwtToken', {
    userId
  })

  const queryParams = {
    TableName: todosTable,
    IndexName: indexName,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  }

  logger.info('Queryind the database', {
    queryParams
  })

  const todos = await docClient.query(queryParams).promise()

  logger.info('Fetching todos for user', {
    todos,
    userId
  })


  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: todos.Items
    })
  }

}
