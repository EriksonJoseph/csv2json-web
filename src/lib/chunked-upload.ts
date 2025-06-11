interface ChunkUploadOptions {
  file: File
  chunkSize?: number
  onProgress?: (progress: number) => void
  onChunkProgress?: (chunkIndex: number, chunkProgress: number) => void
}

interface ChunkUploadResult {
  success: boolean
  data?: any
  error?: string
}

export class ChunkedFileUploader {
  private static readonly DEFAULT_CHUNK_SIZE = 3 * 1024 * 1024 // 3MB

  static async upload({
    file,
    chunkSize = ChunkedFileUploader.DEFAULT_CHUNK_SIZE,
    onProgress,
    onChunkProgress,
  }: ChunkUploadOptions): Promise<ChunkUploadResult> {
    const finalChunkSize = chunkSize || ChunkedFileUploader.DEFAULT_CHUNK_SIZE
    
    try {
      // For small files, use regular upload
      if (file.size <= finalChunkSize) {
        return await ChunkedFileUploader.uploadSingleFile(file, onProgress)
      }

      // For large files, use chunked upload
      return await ChunkedFileUploader.uploadChunked({
        file,
        chunkSize: finalChunkSize,
        onProgress,
        onChunkProgress,
      })
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Upload failed',
      }
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
        error: error.response?.data?.message || error.message || 'Upload failed',
      }
    }
  }

  private static async uploadChunked({
    file,
    chunkSize,
    onProgress,
    onChunkProgress,
  }: Required<Pick<ChunkUploadOptions, 'file' | 'chunkSize'>> & 
    Pick<ChunkUploadOptions, 'onProgress' | 'onChunkProgress'>): Promise<ChunkUploadResult> {
    const totalChunks = Math.ceil(file.size / chunkSize)
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    
    console.log(`🟡 Starting chunked upload: ${totalChunks} chunks for ${file.name}`)

    let uploadedChunks = 0
    let totalUploadedBytes = 0

    // Upload chunks sequentially to avoid overwhelming the server
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      
      const chunkFile = new File([chunk], `${file.name}.part${chunkIndex}`, {
        type: file.type,
      })

      try {
        await ChunkedFileUploader.uploadChunk({
          chunkFile,
          chunkIndex,
          totalChunks,
          uploadId,
          originalFileName: file.name,
          originalFileSize: file.size,
          onChunkProgress: (progress) => {
            onChunkProgress?.(chunkIndex, progress)
            
            // Calculate overall progress
            const chunkBytes = (progress / 100) * chunk.size
            const currentTotalBytes = totalUploadedBytes + chunkBytes
            const overallProgress = (currentTotalBytes / file.size) * 100
            onProgress?.(Math.min(overallProgress, 100))
          },
        })

        uploadedChunks++
        totalUploadedBytes += chunk.size
        
        console.log(`🟢 Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`)
        
        // Update progress for completed chunk
        const overallProgress = (totalUploadedBytes / file.size) * 100
        onProgress?.(Math.min(overallProgress, 100))
        
      } catch (error: any) {
        console.error(`🔴 Failed to upload chunk ${chunkIndex}:`, error)
        return {
          success: false,
          error: `Failed to upload chunk ${chunkIndex + 1}/${totalChunks}: ${error.message}`,
        }
      }
    }

    // All chunks uploaded successfully
    console.log(`🎉 All ${totalChunks} chunks uploaded successfully`)
    return {
      success: true,
      data: {
        uploadId,
        fileName: file.name,
        fileSize: file.size,
        totalChunks,
        message: 'File uploaded successfully in chunks',
      },
    }
  }

  private static async uploadChunk({
    chunkFile,
    chunkIndex,
    totalChunks,
    uploadId,
    originalFileName,
    originalFileSize,
    onChunkProgress,
  }: {
    chunkFile: File
    chunkIndex: number
    totalChunks: number
    uploadId: string
    originalFileName: string
    originalFileSize: number
    onChunkProgress?: (progress: number) => void
  }): Promise<void> {
    const { filesApi } = await import('@/lib/api')
    
    const formData = new FormData()
    formData.append('file', chunkFile)
    
    // Add metadata for chunk reconstruction
    formData.append('chunk_index', chunkIndex.toString())
    formData.append('total_chunks', totalChunks.toString())
    formData.append('upload_id', uploadId)
    formData.append('original_filename', originalFileName)
    formData.append('original_filesize', originalFileSize.toString())

    try {
      await filesApi.upload(formData, onChunkProgress)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Chunk upload failed')
    }
  }
}