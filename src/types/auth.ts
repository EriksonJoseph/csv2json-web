export interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface LoginRequest {
  username: string
  password: string
  remember_me?: boolean
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface TokenRefreshRequest {
  refresh_token: string
}

export interface TokenRefreshRequest {
  refresh_token: string
}

export interface TokenRefreshResponse {
  access_token: string
  token_type: string
  expires_in: number
}
