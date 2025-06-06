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
import { filesApi } from '@/lib/api'
import { formatBytes } from '@/lib/utils'
import toast from 'react-hot-toast'

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

interface SingleFileUploadProps {
  onSuccess?: (fileId: string) => void
  accept?: Record<string, string[]>
  maxSize?: number
  title?: string
  description?: string
}

export function SingleFileUpload({
  onSuccess,
  accept = {
    'text/csv': ['.csv'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
      '.xlsx',
    ],
    'text/plain': ['.txt'],
    'application/json': ['.json'],
  },
  maxSize = 100 * 1024 * 1024, // 100MB
  title = 'Upload File',
  description = 'Upload a file for processing',
}: SingleFileUploadProps) {
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(null)
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      return filesApi.upload(formData, (progress) => {
        setUploadingFile((prev) =>
          prev ? { ...prev, progress } : null
        )
      })
    },
    onSuccess: (data, file) => {
      setUploadingFile((prev) =>
        prev ? { ...prev, status: 'completed', progress: 100 } : null
      )
      queryClient.invalidateQueries({ queryKey: ['files'] })
      toast.success('File uploaded successfully!')
      onSuccess?.(data.data.id)
    },
    onError: (error: any, file) => {
      setUploadingFile((prev) =>
        prev
          ? {
              ...prev,
              status: 'error',
              error: error.response?.data?.message || 'Upload failed',
            }
          : null
      )
      toast.error('Failed to upload file')
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0] // Only take the first file for single upload
      
      setUploadingFile({
        file,
        progress: 0,
        status: 'uploading',
      })

      uploadMutation.mutate(file)
    },
    [uploadMutation]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false, // Single file only
  })

  const removeUploadingFile = () => {
    setUploadingFile(null)
  }

  const resetUpload = () => {
    setUploadingFile(null)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {!uploadingFile && (
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
                <p className="text-lg font-medium">Drop the file here...</p>
              ) : (
                <div>
                  <p className="mb-2 text-lg font-medium">
                    Drag & drop a file here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Single file upload only
                  </p>
                </div>
              )}
            </div>
          )}

          {uploadingFile && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {uploadingFile.status === 'uploading' && (
                    <FileText className="h-6 w-6 text-blue-500" />
                  )}
                  {uploadingFile.status === 'completed' && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {uploadingFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatBytes(uploadingFile.file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeUploadingFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {uploadingFile.status === 'uploading' && (
                    <Progress value={uploadingFile.progress} />
                  )}

                  {uploadingFile.status === 'error' && uploadingFile.error && (
                    <p className="text-xs text-red-500">{uploadingFile.error}</p>
                  )}

                  {uploadingFile.status === 'completed' && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-green-600">Upload completed</p>
                      <Button variant="outline" size="sm" onClick={resetUpload}>
                        Upload Another
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}