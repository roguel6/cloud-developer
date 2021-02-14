import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'


const s3 = new AWS.S3({
    signatureVersion: 'v4'
})
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const logger = createLogger('generateUploadUrl')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event', {
        event
      })

  const todoId = event.pathParameters.todoId
  const userId = parseUserId(event.headers.Authorization)
  const uploadUrl = getUploadUrl(todoId)
  
  logger.info('GetUploadUrl', {
    uploadUrl
  })
  
  await updateItemWithUrl(userId, todoId)

  return {
    statusCode: 201,
    headers: {
        'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
  
}

async function updateItemWithUrl (userId: string, todoId: string) {
    logger.info('updateItemWithUrl', {
        userId,
        todoId
    })
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
    var params = {
        TableName: todosTable,
        Key: {
            "userId": userId,
            "todoId": todoId
        },
        UpdateExpression: "set attachmentUrl = :au",
        ExpressionAttributeValues:{
            ":au": attachmentUrl
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
}



function getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: imageId,
      Expires: urlExpiration
    })
}
