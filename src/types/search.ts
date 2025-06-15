import { BackgroundProcessStatus, PaginatedResponse } from '@/types/common'
import { Task } from '@/types/tasks'

export interface CreateSearchRequest {
  task_id: string
  column_names: string[]
  column_options: {
    [key: string]: {
      whole_word: boolean
      match_case: boolean
      match_length: boolean
    }
  }
  list: {
    no: number
    [key: string]: string | number
  }[]
}

export interface SearchListPaginationResult {
  _id: string
  task_id: string
  column_names: string[]
  total_queries: number
  total_rows: number
  status: BackgroundProcessStatus
  created_by: string
  created_at: string
  updated_at: string
  updated_by: string
  completed_at: string
  execution_time_ms: number
  processing_time: number
  results_found: number
  total_searched: number
  query_name_length: number
  original_filename: string
  task_topic: string
}

export interface SearchListResponse
  extends PaginatedResponse<SearchListPaginationResult> {}

export interface SearchHistoryResponse {
  _id: string
  task_id: string
  column_names: string[]
  column_options: {
    [key: string]: {
      whole_word: boolean
      match_case: boolean
      match_length: boolean
    }
  }
  query_list: {
    no: string
    [key: string]: string | number
  }[]
  total_queries: number
  total_rows: number
  status: BackgroundProcessStatus
  created_by: string
  task_topic: string
  original_filename: string
  created_at: string
  updated_at: string
  updated_by: string
  completed_at: string
  execution_time_ms: number
  processing_time: number
  error_message?: string
  results: {
    query_no: number
    query_name: string
    column_results: {
      [key: string]: {
        found: boolean
        count: number
        search_term: string
      }
    }
  }[]
  results_found: number
  total_searched: number
  task_detail: Task
}
