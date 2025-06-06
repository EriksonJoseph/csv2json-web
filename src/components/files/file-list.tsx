'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Download,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { filesApi } from '@/lib/api'
import { FileItem } from '@/types'
import { formatBytes, formatRelativeTime, downloadFile } from '@/lib/utils'
import toast from 'react-hot-toast'

export function FileList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: filesData, isLoading } = useQuery({
    queryKey: ['files', page, searchQuery, statusFilter],
    queryFn: () =>
      filesApi
        .list({
          page,
          per_page: 10,
          // Note: These filters would need to be implemented in the backend
        })
        .then((res) => res.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => filesApi.delete(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      toast.success('File deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete file')
    },
  })

  const downloadMutation = useMutation({
    mutationFn: (fileId: string) => filesApi.download(fileId),
    onSuccess: (response, fileId) => {
      const file = filesData?.files.find((f) => f.id === fileId)
      if (file && response.data) {
        downloadFile(response.data, file.filename)
        toast.success('File downloaded successfully')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to download file')
    },
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'default',
      processing: 'default',
      completed: 'default',
      failed: 'destructive',
    } as const

    const colors = {
      pending:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      processing:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }

    return (
      <Badge
        className={colors[status as keyof typeof colors] || colors.pending}
      >
        {status}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 animate-pulse rounded bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Files</CardTitle>
              <CardDescription>Manage your uploaded files</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filesData?.files.length ? (
            <div className="space-y-4">
              {filesData.files.map((file: FileItem) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{file.filename}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatBytes(file.file_size)}</span>
                        <span>{formatRelativeTime(file.uploaded_at)}</span>
                        <span className="capitalize">{file.file_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(file.status)}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            /* Navigate to file details */
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => downloadMutation.mutate(file.id)}
                          disabled={file.status !== 'completed'}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteMutation.mutate(file.id)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {filesData.total_pages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * 10 + 1} to{' '}
                    {Math.min(page * 10, filesData.total)} of {filesData.total}{' '}
                    files
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= filesData.total_pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                No files found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Upload your first file to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
