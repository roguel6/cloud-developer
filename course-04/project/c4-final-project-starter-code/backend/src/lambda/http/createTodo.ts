import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import { TodoItem } from '../../models/TodoItem'
import { parseUserId } from '../../auth/utils'


const logger = createLogger('createTodo')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event', {
    event
  })

  const itemId = uuid.v4()
  const parsedBody: CreateTodoRequest = JSON.parse(event.body)
  const userId = parseUserId(event.headers.Authorization)


  const newTodo: TodoItem = {
    todoId: itemId,
    userId: userId,
    createdAt: new Date().toISOString(),
    done: false,
    ...parsedBody
  }

  logger.info('New Todo object', {
    newTodo
  })

  const result = await docClient.put({
    TableName: todosTable,
    Item: newTodo
  }).promise()
  logger.info('Create Item succeed', {
    result
  })

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
        item: newTodo
    })
  }
}
