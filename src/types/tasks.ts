import { PaginatedResponse } from '@/types/common'
export interface Task {
  _id: string
  topic: string
  created_file_date: string
  updated_file_date: string
  references?: string
  file_id: string
  is_done_created_doc: boolean
  processing_time: number
  error_message?: string
  created_at: string
  updated_at: string
  total_rows?: number
  total_columns?: number
  column_names: string[]
}

export interface TaskCreateRequest {
  topic: string
  created_file_date: string
  updated_file_date: string
  references?: string
  file_id: string
}

export interface TaskCreateResponse {
  task: Task
  message: string
}

export interface TaskListResponse extends PaginatedResponse<Task> {}

export interface CurrentProcessingTask {
  task?: Task
  queue_position?: number
  estimated_time?: number
}
