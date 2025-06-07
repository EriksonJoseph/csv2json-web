export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed'

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

export interface TaskListResponse {
  list: Task[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface CurrentProcessingTask {
  task?: Task
  queue_position?: number
  estimated_time?: number
}
