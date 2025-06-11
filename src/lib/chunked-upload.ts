interface ChunkUploadOptions {
  file: File
  chunkSize?: number
  onProgress?: (progress: number) => void
  onChunkProgress?: (chunkIndex: number, chunkProgress: number) => void
  onStatusChange?: (
    status: 'uploading' | 'processing' | 'completed' | 'failed'
  ) => void
  onCancel?: () => void
}

interface ChunkUploadResult {
  success: boolean
  data?: any
  error?: string
  uploadId?: string
}

interface ChunkUploadSession {
  uploadId: string
  totalChunks: number
  chunkSize: number
  retryCount: { [chunkNumber: number]: number }
  cancelled: boolean
}

export class ChunkedFileUploader {
  private static readonly DEFAULT_CHUNK_SIZE = 4 * 1024 * 1024 // 4MB
  private static readonly FILE_SIZE_THRESHOLD = 4.5 * 1024 * 1024 // 4.5MB
  private static readonly MAX_RETRIES = 3
  private static activeSessions = new Map<string, ChunkUploadSession>()

  static async upload({
    file,
    chunkSize = ChunkedFileUploader.DEFAULT_CHUNK_SIZE,
    onProgress,
    onChunkProgress,
    onStatusChange,
    onCancel,
  }: ChunkUploadOptions): Promise<ChunkUploadResult> {
    const finalChunkSize = chunkSize || ChunkedFileUploader.DEFAULT_CHUNK_SIZE

    try {
      // For small files (< 4.5MB), use regular upload
      if (file.size <= ChunkedFileUploader.FILE_SIZE_THRESHOLD) {
        onStatusChange?.('uploading')
        const result = await ChunkedFileUploader.uploadSingleFile(
          file,
          onProgress
        )
        onStatusChange?.(result.success ? 'completed' : 'failed')
        return result
      }

      // For large files, use chunked upload
      onStatusChange?.('uploading')
      const result = await ChunkedFileUploader.uploadChunked({
        file,
        chunkSize: finalChunkSize,
        onProgress,
        onChunkProgress,
        onStatusChange,
        onCancel,
      })
      return result
    } catch (error: any) {
      onStatusChange?.('failed')
      return {
        success: false,
        error: error.message || 'Upload failed',
      }
    }
  }

  static async cancelUpload(uploadId: string): Promise<void> {
    const session = ChunkedFileUploader.activeSessions.get(uploadId)
    if (session) {
      session.cancelled = true
      try {
        const { api } = await import('@/lib/axios')
        await api.delete(`/files/chunked/${uploadId}`)
      } catch (error) {
        console.warn('Failed to cancel upload on server:', error)
      }
      ChunkedFileUploader.activeSessions.delete(uploadId)
    }
  }

  private static async uploadSingleFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ChunkUploadResult> {
    const { filesApi } = await import('@/lib/api')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await filesApi.upload(formData, onProgress)
      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || 'Upload failed',
      }
    }
  }

  private static async uploadChunked({
    file,
    chunkSize,
    onProgress,
    onChunkProgress,
    onStatusChange,
    onCancel,
  }: Required<Pick<ChunkUploadOptions, 'file' | 'chunkSize'>> &
    Pick<
      ChunkUploadOptions,
      'onProgress' | 'onChunkProgress' | 'onStatusChange' | 'onCancel'
    >): Promise<ChunkUploadResult> {
    const totalChunks = Math.ceil(file.size / chunkSize)
    const { api } = await import('@/lib/axios')

    try {
      // Step 1: Initiate chunked upload
      const initiateResponse = await api.post('/files/chunked/initiate', {
        filename: file.name,
        total_size: file.size,
        chunk_size: chunkSize,
        mime_type: file.type || 'application/octet-stream',
      })

      const { upload_id: uploadId } = initiateResponse.data
      console.log(
        `🟡 Starting chunked upload: ${totalChunks} chunks for ${file.name} (ID: ${uploadId})`
      )

      // Create session for tracking
      const session: ChunkUploadSession = {
        uploadId,
        totalChunks,
        chunkSize,
        retryCount: {},
        cancelled: false,
      }
      ChunkedFileUploader.activeSessions.set(uploadId, session)

      let totalUploadedBytes = 0

      // Step 2: Upload chunks sequentially
      for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
        if (session.cancelled) {
          throw new Error('Upload cancelled')
        }

        const start = chunkNumber * chunkSize
        const end = Math.min(start + chunkSize, file.size)
        const chunk = file.slice(start, end)

        let success = false
        let lastError: Error | null = null

        // Retry logic for each chunk
        for (let retry = 0; retry <= ChunkedFileUploader.MAX_RETRIES; retry++) {
          try {
            const formData = new FormData()
            formData.append('chunk', chunk, `${file.name}.chunk${chunkNumber}`)
            formData.append('chunk_number', chunkNumber.toString())

            const chunkResponse = await api.post(
              `/files/chunked/${uploadId}/chunk`,
              formData,
              {
                timeout: 600000,
                onUploadProgress: (progressEvent) => {
                  if (progressEvent.total) {
                    const chunkProgress = Math.round(
                      (progressEvent.loaded * 100) / progressEvent.total
                    )
                    onChunkProgress?.(chunkNumber, chunkProgress)

                    // Calculate overall progress
                    const chunkBytes = (chunkProgress / 100) * chunk.size
                    const currentTotalBytes = totalUploadedBytes + chunkBytes
                    const overallProgress =
                      (currentTotalBytes / file.size) * 100
                    onProgress?.(Math.min(overallProgress, 100))
                  }
                },
              }
            )

            const { status, file_data } = chunkResponse.data

            // Check if upload is completed
            if (status === 'completed' && file_data) {
              onStatusChange?.('processing')
              setTimeout(() => onStatusChange?.('completed'), 500) // Simulate processing time

              ChunkedFileUploader.activeSessions.delete(uploadId)
              return {
                success: true,
                data: file_data,
                uploadId,
              }
            }

            success = true
            totalUploadedBytes += chunk.size
            console.log(
              `🟢 Chunk ${chunkNumber + 1}/${totalChunks} uploaded successfully`
            )

            // Update progress for completed chunk
            const overallProgress = (totalUploadedBytes / file.size) * 100
            onProgress?.(Math.min(overallProgress, 100))
            break
          } catch (error: any) {
            lastError = error
            session.retryCount[chunkNumber] =
              (session.retryCount[chunkNumber] || 0) + 1

            if (retry < ChunkedFileUploader.MAX_RETRIES) {
              console.warn(
                `🔴 Chunk ${chunkNumber} failed, retrying... (${retry + 1}/${ChunkedFileUploader.MAX_RETRIES})`
              )
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * (retry + 1))
              ) // Exponential backoff
            } else {
              console.error(
                `🔴 Chunk ${chunkNumber} failed after ${ChunkedFileUploader.MAX_RETRIES} retries:`,
                error
              )
            }
          }
        }

        if (!success) {
          ChunkedFileUploader.activeSessions.delete(uploadId)
          return {
            success: false,
            error: `Failed to upload chunk ${chunkNumber + 1}/${totalChunks} after ${ChunkedFileUploader.MAX_RETRIES} retries: ${lastError?.message}`,
            uploadId,
          }
        }
      }

      // All chunks uploaded, wait for completion
      onStatusChange?.('processing')
      ChunkedFileUploader.activeSessions.delete(uploadId)

      return {
        success: true,
        data: {
          uploadId,
          fileName: file.name,
          fileSize: file.size,
          totalChunks,
          message: 'File uploaded successfully in chunks',
        },
        uploadId,
      }
    } catch (error: any) {
      // uploadId might not be available if initiate failed
      return {
        success: false,
        error: error.message || 'Chunked upload failed',
      }
    }
  }
}
