import {
  CreateSearchRequest,
  SearchHistoryResponse,
  SearchListResponse,
} from '@/types/search'
import api from './axios'
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TokenRefreshRequest,
  User,
  FileItem,
  FileListResponse,
  Task,
  TaskCreateRequest,
  TaskListResponse,
  CurrentProcessingTask,
  UserProfile,
  UserUpdateRequest,
  ChangePasswordRequest,
  PaginationParams,
} from '@/types'

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  refresh: (data: TokenRefreshRequest) =>
    api.post<AuthResponse>('/auth/refresh', data),

  changePassword: (userId: string, data: ChangePasswordRequest) =>
    api.patch<string>(`/auth/change-password/${userId}`, data),

  logout: (data: TokenRefreshRequest) => api.post('/auth/logout', data),

  me: () => api.get<User>('/auth/me'),
}

export const filesApi = {
  upload: (data: FormData, onProgress?: (progress: number) => void) =>
    api.post<FileItem>('/files/upload', data, {
      timeout: 60000, // 60 seconds for Vercel Hobby plan
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(progress)
        }
      },
    }),

  list: (params?: PaginationParams) =>
    api.get<FileListResponse>('/files', { params }),

  get: (id: string) => api.get<FileItem>(`/files/${id}`),

  download: (id: string) =>
    api.get(`/files/download/${id}`, { responseType: 'blob' }),

  delete: (id: string) => api.delete(`/files/${id}`),
}

export const tasksApi = {
  create: (data: TaskCreateRequest) => api.post<Task>('/task', data),

  list: (params?: PaginationParams) =>
    api.get<TaskListResponse>('/task', { params }),

  get: (id: string) => api.get<Task>(`/task/${id}`),

  delete: (id: string) => api.delete(`/task/${id}`),

  getCurrentProcessing: () =>
    api.get<CurrentProcessingTask>('/task/current-processing'),
}

export const searchApi = {
  create: (data: CreateSearchRequest) => api.post<string>('/search', data),

  list: (params: PaginationParams) =>
    api.get<SearchListResponse>('/search/history', { params }),

  getResult: (id: string) =>
    api.get<SearchHistoryResponse>(`/search/result/${id}`),

  delete: (search_id: string) => api.delete<string>(`search/${search_id}`),
}

export const usersApi = {
  getMe: () => api.get('/user/me'),

  getProfile: () => api.get<UserProfile>('/user/profile'),

  updateProfile: (userId: string, data: UserUpdateRequest) =>
    api.patch<UserProfile>(`/user/${userId}`, data),

  changePassword: (data: ChangePasswordRequest) =>
    api.post('/user/change-password', data),

  list: (params?: PaginationParams) => api.get('user', { params }),
}
