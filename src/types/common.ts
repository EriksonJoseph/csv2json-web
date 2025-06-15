export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginationParams {
  page: number
  limit: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface PaginationConfig {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  maxVisiblePages?: number
  showInfo?: boolean
  showItemsPerPageSelector?: boolean
  itemsPerPageOptions?: number[]
}

export interface ErrorResponse {
  error: string
  message: string
  status_code: number
  details?: Record<string, any>
}

export interface LoadingState {
  isLoading: boolean
  error?: string
}

export type BackgroundProcessStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'

export type Theme = 'light' | 'dark' | 'system'

export interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  task_completion: boolean
  system_alerts: boolean
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  database: 'connected' | 'disconnected'
  redis: 'connected' | 'disconnected'
  storage: 'available' | 'unavailable'
  background_tasks: 'running' | 'stopped'
  last_check: string
}
