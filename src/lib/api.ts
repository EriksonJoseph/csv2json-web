import api from './axios'
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TokenRefreshRequest,
  User,
  FileItem,
  FileUploadRequest,
  FileListResponse,
  Task,
  TaskCreateRequest,
  TaskListResponse,
  CurrentProcessingTask,
  TaskColumnsResponse,
  SearchRequest,
  SearchResponse,
  BulkSearchRequest,
  BulkSearchResponse,
  SearchHistoryResponse,
  Watchlist,
  WatchlistCreateRequest,
  WatchlistResponse,
  WatchlistItemCreateRequest,
  WatchlistMatchRequest,
  WatchlistMatchResponse,
  UserProfile,
  UserUpdateRequest,
  ChangePasswordRequest,
  UserActivityResponse,
  UserStats,
  PaginationParams,
  WatchlistUpdateRequest,
} from '@/types'

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  refresh: (data: TokenRefreshRequest) =>
    api.post<AuthResponse>('/auth/refresh', data),

  logout: (data: TokenRefreshRequest) => api.post('/auth/logout', data),

  me: () => api.get<User>('/auth/me'),
}

export const filesApi = {
  upload: (data: FormData, onProgress?: (progress: number) => void) =>
    api.post<FileItem>('/files/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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

export const matchingApi = {
  getColumns: (taskId: string) =>
    api.get<TaskColumnsResponse>(`/matching/columns/${taskId}`),

  search: (data: SearchRequest) =>
    api.post<SearchResponse>('/matching/search', data),

  bulkSearch: (data: BulkSearchRequest) =>
    api.post<BulkSearchResponse>('/matching/bulk-search', data),

  getHistory: (params?: PaginationParams) =>
    api.get<SearchHistoryResponse>('/matching/history', { params }),
}

export const watchlistsApi = {
  list: (params?: PaginationParams) =>
    api.get<WatchlistResponse>('/watchlist', { params }),

  create: (data: WatchlistCreateRequest) =>
    api.post<Watchlist>('/watchlist', data),

  get: (id: string) => api.get<Watchlist>(`/watchlist/${id}`),

  update: (id: string, data: WatchlistUpdateRequest) =>
    api.put<Watchlist>(`/watchlist/${id}`, data),

  delete: (id: string) => api.delete(`/watchlist/${id}`),

  addItem: (watchlistId: string, data: WatchlistItemCreateRequest) =>
    api.post(`/watchlist/${watchlistId}/items`, data),

  updateItem: (
    watchlistId: string,
    itemId: string,
    data: Partial<WatchlistItemCreateRequest>
  ) => api.put(`/watchlist/${watchlistId}/items/${itemId}`, data),

  deleteItem: (watchlistId: string, itemId: string) =>
    api.delete(`/watchlist/${watchlistId}/items/${itemId}`),

  match: (data: WatchlistMatchRequest) =>
    api.post<WatchlistMatchResponse>('/watchlist/match', data),
}

export const usersApi = {
  getProfile: () => api.get<UserProfile>('/user/profile'),

  updateProfile: (data: UserUpdateRequest) =>
    api.put<UserProfile>('/user/profile', data),

  changePassword: (data: ChangePasswordRequest) =>
    api.post('/user/change-password', data),

  getActivity: (params?: PaginationParams) =>
    api.get<UserActivityResponse>('/user/activity', { params }),

  getStats: () => api.get<UserStats>('/user/stats'),
}
