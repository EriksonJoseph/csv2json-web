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

interface FileUploadProps {
  afterSuccess?: (data: any) => void
}

export function FileUpload({ afterSuccess }: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      return filesApi.upload(formData, (progress) => {
        setUploadingFiles((prev) =>
          prev.map((f) => (f.file === file ? { ...f, progress } : f))
        )
      })
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
                status: 'error',
                error: error.response?.data?.message || 'Upload failed',
              }
            : f
        )
      )
      toast.error('Failed to upload file')
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
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
    [uploadMutation]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false,
  })

  const removeUploadingFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file))
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
                  Supports CSV, Excel, TXT, JSON files up to 100MB
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
                        onClick={() => removeUploadingFile(uploadingFile.file)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {uploadingFile.status === 'uploading' && (
                      <Progress value={uploadingFile.progress} />
                    )}

                    {uploadingFile.status === 'error' &&
                      uploadingFile.error && (
                        <p className="text-xs text-red-500">
                          {uploadingFile.error}
                        </p>
                      )}

                    {uploadingFile.status === 'completed' && (
                      <p className="text-xs text-green-600">Upload completed</p>
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
