import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'

import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const todosAccess = new TodosAccess()
const logger = createLogger('Todos businessLogic')

/**
 * Get the Todos for a specific user over the dataLayer
 * @param userId the user id
 * @returns a json array with the todos
 */
export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info('Get Todos', {
    userId
  })
  return await todosAccess.getTodos(userId)
}

/**
 * Update a Todo for a specific user over the dataLayer
 * @param userId the user id
 * @param todoId the todo id
 * @param updatedTodo a json object with the fields to be updated
 */
export async function updateTodo(
  userId: string,
  todoId: string,
  updatedTodo: UpdateTodoRequest
) {
  logger.info('Update Todo', {
    userId,
    updatedTodo
  })
  await todosAccess.updateTodo(userId, todoId, updatedTodo)
}

/**
 * Create a Todo for a specific user over the dataLayer
 * @param userId the user id
 * @param createdTodo a json object representing a new todo item
 * @returns a json object with the new todo
 */
export async function createTodo(
  userId: string,
  createdTodo: CreateTodoRequest
): Promise<TodoItem> {
  logger.info('Create Todo', {
    userId,
    createdTodo
  })
  return await todosAccess.createTodo(userId, createdTodo)
}

/**
 * Delete a Todo for a specific user over the dataLayer
 * @param userId the user id
 * @param todoId the todo id
 */
export async function deleteTodo(userId: string, todoId: string) {
  logger.info('Delete Todo', {
    userId,
    todoId
  })
  await todosAccess.deleteTodo(userId, todoId)
}

/**
 * Generates an upload Url to attach an image to a todo item over the dataLayer
 * @param userId the user id
 * @param todoId the todo id
 * @returns the upload url
 */
export async function generateUploadUrl(userId: string, todoId: string) {
  const uploadUrl = await todosAccess.getUploadUrl(todoId)

  logger.info('GetUploadUrl', {
    uploadUrl
  })

  await todosAccess.updateAttachmentUrl(userId, todoId)
  return uploadUrl
}
