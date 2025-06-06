export interface UserProfile {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  avatar?: string
  bio?: string
  phone?: string
  timezone?: string
  language?: string
  created_at: string
  updated_at: string
  last_login?: string
}

export interface UserUpdateRequest {
  first_name?: string
  last_name?: string
  email?: string
  bio?: string
  phone?: string
  timezone?: string
  language?: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface UserActivity {
  id: string
  action: string
  description: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface UserActivityResponse {
  activities: UserActivity[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface UserStats {
  total_files: number
  total_tasks: number
  total_searches: number
  storage_used: number
  last_login: string
  account_created: string
}
