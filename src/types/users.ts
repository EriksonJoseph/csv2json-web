import { PaginatedResponse } from './common'

export interface UserProfile {
  id: string
  username: string
  email: string
  first_name: string
  middle_name?: string
  last_name: string
}

export interface UserUpdateRequest {
  first_name: string
  middle_name?: string
  last_name: string
  email: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface VerifyEmailRequest {
  token: string
  password: string
  confirm_password: string
}

export interface ResetPasswordRequest extends VerifyEmailRequest {}

export interface ForgotPasswordRequest {
  email: string
}

// User Management Types
export interface UserManagementItem {
  user_id: string
  username: string
  email: string
  first_name?: string
  middle_name?: string
  last_name?: string
  role: 'admin' | 'user'
  is_locked: boolean
  is_email_verified: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface UserManagementListResponse {
  items: UserManagementItem[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface UnlockUserRequest {
  user_id: string
}

export interface ResendVerificationRequest {
  user_id: string
}

export interface UserListResult {
  _id: string
  username: string
  email: string
  first_name: string
  last_name: string
  middle_name: string
  roles: string[]
  is_active: boolean
  is_locked: boolean
  is_verify_email: boolean
  email_verification_token: string
  email_verification_expires: string
  failed_login_attempts: number
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
  last_login: string
  last_login_ip: string
  password_reset_expires: unknown
  password_reset_token: string
}

export interface UserListResponse extends PaginatedResponse<UserListResult> {}
