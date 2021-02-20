import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodoAccess')
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexName = process.env.TODOS_TABLE_SEC_INDEX
  ) {}

  /**
   * Get the Todos for a specific user
   * @param userId the user id
   * @returns a json array with the todos
   */
  async getTodos(userId: string): Promise<TodoItem[]> {
    const queryParams = {
      TableName: this.todosTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    logger.info('Querying the database with params:', {
      queryParams
    })

    const result = await this.docClient.query(queryParams).promise()

    logger.info('Result:', {
      result
    })

    const items = result.Items
    return items as TodoItem[]
  }

  /**
   * Update a Todo for a specific user
   * @param userId the user id
   * @param todoId the todo id
   * @param updatedTodo a json object with the fields to be updated
   */
  async updateTodo(
    userId: string,
    todoId: string,
    updatedTodo: UpdateTodoRequest
  ) {
    var params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set #todoName = :n, dueDate=:dd, done=:d',
      ExpressionAttributeValues: {
        ':n': updatedTodo.name,
        ':dd': updatedTodo.dueDate,
        ':d': updatedTodo.done
      },
      ExpressionAttributeNames: {
        '#todoName': 'name'
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
   * Create a Todo for a specific user
   * @param userId the user id
   * @param todoRequest a json object representing a new todo item
   * @returns a json object with the new todo
   */
  async createTodo(
    userId: string,
    todoRequest: CreateTodoRequest
  ): Promise<TodoItem> {
    const itemId = uuid.v4()
    const newTodo: TodoItem = {
      todoId: itemId,
      userId: userId,
      createdAt: new Date().toISOString(),
      done: false,
      ...todoRequest
    }

    logger.info('New Todo object', {
      newTodo
    })

    const result = await this.docClient
      .put({
        TableName: this.todosTable,
        Item: newTodo
      })
      .promise()

    logger.info('Create Item succeed', {
      result
    })

    return newTodo
  }

  /**
   * Delete a Todo for a specific user
   * @param userId the user id
   * @param todoId the todo id
   */
  async deleteTodo(userId: string, todoId: string) {
    var params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
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
   * Generates an upload Url to attach an image to a todo item
   * @param userId the user id
   * @param todoId the todo id
   * @returns the upload url
   */
  async getUploadUrl(todoId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: urlExpiration
    })
  }

  /**
   * Updates the image url for a specific todo
   * @param userId the user id
   * @param todoId the todo id
   */
  async updateAttachmentUrl(userId: string, todoId: string) {
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
    var params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set attachmentUrl = :au',
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
