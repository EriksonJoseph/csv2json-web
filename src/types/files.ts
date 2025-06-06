export type FileStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface FileItem {
  id: string
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  file_type: string
  status: FileStatus
  uploaded_by: string
  uploaded_at: string
  processed_at?: string
  error_message?: string
  metadata?: Record<string, any>
}

export interface FileUploadRequest {
  file: File
  description?: string
}

export interface FileUploadResponse {
  file: FileItem
  message: string
}

export interface FileListResponse {
  files: FileItem[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface FileDownloadResponse {
  download_url: string
  expires_at: string
}
