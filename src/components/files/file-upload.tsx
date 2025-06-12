'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { formatBytes } from '@/lib/utils'
import { ChunkedFileUploader } from '@/lib/chunked-upload'
import toast from 'react-hot-toast'

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  error?: string
  isChunked?: boolean
  currentChunk?: number
  totalChunks?: number
  uploadId?: string
  estimatedTimeLeft?: string
  startTime?: number
}

interface FileUploadProps {
  afterSuccess?: (data: any) => void
  onClearFile?: () => void
  uploadedFile?: any
  maxFiles?: number
  maxSize?: number
}

export function FileUpload({
  afterSuccess,
  onClearFile,
  uploadedFile,
  maxFiles = 5,
  maxSize = 100 * 1024 * 1024, // 100MB default
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const CHUNK_SIZE = 4 * 1024 * 1024 // 4MB chunks
      const FILE_SIZE_THRESHOLD = 4.5 * 1024 * 1024 // 4.5MB
      const isLargeFile = file.size > FILE_SIZE_THRESHOLD

      // Mark file with initial info
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                isChunked: isLargeFile,
                totalChunks: isLargeFile
                  ? Math.ceil(file.size / CHUNK_SIZE)
                  : 1,
                startTime: Date.now(),
              }
            : f
        )
      )

      const result = await ChunkedFileUploader.upload({
        file,
        chunkSize: CHUNK_SIZE,
        onProgress: (progress) => {
          setUploadingFiles((prev) =>
            prev.map((f) => {
              if (f.file === file) {
                // Calculate estimated time left
                const elapsed = Date.now() - (f.startTime || Date.now())
                const estimatedTotal = elapsed / (progress / 100)
                const timeLeft = estimatedTotal - elapsed
                const estimatedTimeLeft =
                  timeLeft > 0 ? `${Math.ceil(timeLeft / 1000)}s` : ''

                return { ...f, progress, estimatedTimeLeft }
              }
              return f
            })
          )
        },
        onChunkProgress: (chunkIndex) => {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === file ? { ...f, currentChunk: chunkIndex + 1 } : f
            )
          )
        },
        onStatusChange: (status) => {
          setUploadingFiles((prev) =>
            prev.map((f) => (f.file === file ? { ...f, status } : f))
          )
        },
      })

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      // Store upload ID for cancellation
      if (result.uploadId) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, uploadId: result.uploadId } : f
          )
        )
      }

      return { data: result.data }
    },
    onSuccess: (data, file) => {
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file === file ? { ...f, status: 'completed', progress: 100 } : f
        )
      )
      queryClient.invalidateQueries({ queryKey: ['files'] })
      toast.success('File uploaded successfully!')
      if (afterSuccess) {
        afterSuccess(data?.data)
      }
    },
    onError: (error: any, file) => {
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                status: 'failed',
                error:
                  error.response?.data?.message ||
                  error.message ||
                  'Upload failed',
              }
            : f
        )
      )
      toast.error('Failed to upload file')
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Check file size limit
      const oversizedFiles = acceptedFiles.filter((file) => file.size > maxSize)
      if (oversizedFiles.length > 0) {
        toast.error(`File size must not exceed ${formatBytes(maxSize)}`)
        return
      }

      // Check max files limit
      const totalFiles = uploadingFiles.length + acceptedFiles.length
      if (totalFiles > maxFiles) {
        toast.error(
          `Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`
        )
        return
      }

      // If single file mode and already has a file, prevent new upload
      if (maxFiles === 1 && uploadingFiles.length > 0) {
        toast.error('Please remove the current file before uploading a new one')
        return
      }

      const newUploadingFiles = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'uploading' as const,
      }))

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles])

      acceptedFiles.forEach((file) => {
        uploadMutation.mutate(file)
      })
    },
    [uploadMutation, maxFiles, maxSize, uploadingFiles.length]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxSize: maxSize,
    multiple: maxFiles > 1,
    disabled: uploadMutation.isPending,
  })

  const cancelUpload = async (uploadingFile: UploadingFile) => {
    if (uploadingFile.uploadId && uploadingFile.isChunked) {
      try {
        await ChunkedFileUploader.cancelUpload(uploadingFile.uploadId)
        toast.success('Upload cancelled')
      } catch (error) {
        console.warn('Failed to cancel upload:', error)
      }
    }
    setUploadingFiles((prev) =>
      prev.filter((f) => f.file !== uploadingFile.file)
    )

    // Clear file ID if this was the uploaded file
    if (uploadingFile.status === 'completed' && onClearFile) {
      onClearFile()
    }
  }

  const getStatusText = (uploadingFile: UploadingFile) => {
    switch (uploadingFile.status) {
      case 'uploading':
        if (uploadingFile.isChunked && uploadingFile.totalChunks) {
          return `Uploading... (${uploadingFile.currentChunk || 1}/${uploadingFile.totalChunks} chunks)`
        }
        return 'Uploading...'
      case 'processing':
        return 'Processing...'
      case 'completed':
        return 'Complete!'
      case 'failed':
        return 'Failed'
      default:
        return 'Uploading...'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600'
      case 'processing':
        return 'text-yellow-600'
      case 'completed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Upload CSV, Excel, TXT, or JSON files for processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop the files here...</p>
            ) : (
              <div>
                <p className="mb-2 text-lg font-medium">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV, Excel, TXT, JSON files up to{' '}
                  {formatBytes(maxSize)}
                  {maxFiles === 1
                    ? ' (1 file only)'
                    : ` (max ${maxFiles} files)`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadingFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadingFiles.map((uploadingFile, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {(uploadingFile.status === 'uploading' ||
                      uploadingFile.status === 'processing') && (
                      <FileText className="h-6 w-6 text-blue-500" />
                    )}
                    {uploadingFile.status === 'completed' && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                    {uploadingFile.status === 'failed' && (
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {uploadingFile.file.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {formatBytes(uploadingFile.file.size)}
                            {uploadingFile.estimatedTimeLeft && (
                              <span className="ml-2 text-blue-600">
                                ~{uploadingFile.estimatedTimeLeft} left
                              </span>
                            )}
                          </p>
                          <p
                            className={`text-xs font-medium ${getStatusColor(uploadingFile.status)}`}
                          >
                            {getStatusText(uploadingFile)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelUpload(uploadingFile)}
                        disabled={false}
                        title={
                          uploadingFile.status === 'completed'
                            ? 'Remove file'
                            : 'Cancel upload'
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {(uploadingFile.status === 'uploading' ||
                      uploadingFile.status === 'processing') && (
                      <div className="space-y-1">
                        <Progress value={uploadingFile.progress} />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{Math.round(uploadingFile.progress)}%</span>
                          {uploadingFile.isChunked &&
                            uploadingFile.totalChunks && (
                              <span>
                                Chunk {uploadingFile.currentChunk || 1} of{' '}
                                {uploadingFile.totalChunks}
                              </span>
                            )}
                        </div>
                      </div>
                    )}

                    {uploadingFile.status === 'failed' &&
                      uploadingFile.error && (
                        <p className="text-xs text-red-500">
                          {uploadingFile.error}
                        </p>
                      )}

                    {uploadingFile.status === 'completed' && (
                      <p className="text-xs text-green-600">
                        Upload completed successfully!
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
