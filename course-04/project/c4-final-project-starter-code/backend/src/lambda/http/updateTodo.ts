/**
 * Lamba function to update a todo
 */


import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import {APIGatewayProxyEvent,APIGatewayProxyHandler,APIGatewayProxyResult} from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { parseUserId } from '../../auth/utils'
import { updateTodo } from '../../businessLogic/todos'


const logger = createLogger('updateTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event', {
    event
  })
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId = parseUserId(event.headers.Authorization)
  const todoId = event.pathParameters.todoId

  try {
    await updateTodo(userId, todoId, updatedTodo)
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
