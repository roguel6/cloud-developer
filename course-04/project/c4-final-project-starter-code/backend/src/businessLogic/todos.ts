import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'

import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const todosAccess = new TodosAccess()
const logger = createLogger('Todos businessLogic')

export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info('Get Todos', {
    userId
  })
  return await todosAccess.getTodos(userId)
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updatedTodo: UpdateTodoRequest
) {
  logger.info('Update Todo', {
    userId,
    updatedTodo
  })
  return await todosAccess.updateTodo(userId, todoId, updatedTodo)
}

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

export async function deleteTodo(userId: string, todoId: string) {
  logger.info('Delete Todo', {
    userId,
    todoId
  })
  return await todosAccess.deleteTodo(userId, todoId)
}

export async function generateUploadUrl(userId: string, todoId: string) {
  const uploadUrl = await todosAccess.getUploadUrl(todoId)

  logger.info('GetUploadUrl', {
    uploadUrl
  })

  await todosAccess.updateAttachmentUrl(userId, todoId)
  return uploadUrl
}
