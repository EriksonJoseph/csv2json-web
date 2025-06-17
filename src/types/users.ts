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
