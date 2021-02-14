import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import {APIGatewayProxyEvent,APIGatewayProxyHandler,APIGatewayProxyResult} from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { parseUserId } from '../../auth/utils'


const logger = createLogger('updateTodo')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event', {
    event
  })
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId = parseUserId(event.headers.Authorization)


  var params = {
    TableName: todosTable,
    Key: {
        "userId": userId,
        "todoId": todoId
    },
    UpdateExpression: "set #todoName = :n, dueDate=:dd, done=:d",
    ExpressionAttributeValues:{
        ":n": updatedTodo.name,
        ":dd": updatedTodo.dueDate,
        ":d": updatedTodo.done
    },
    ExpressionAttributeNames:{
      "#todoName": "name"
    },
    ReturnValues:"UPDATED_NEW"
  };
  logger.info('Parameter for the update operation', {
    params
  })

  const result = await docClient.update(params).promise()
  logger.info('Update Item succeed', {
    result
  })
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ""
  }

  
}
