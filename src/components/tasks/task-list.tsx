'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
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
import { Progress } from '@/components/ui/progress'
import {
  ListTodo,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { tasksApi } from '@/lib/api'
import { Task } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { LoadingSpinner, LoadingCard } from '@/components/ui/loading'
import toast from 'react-hot-toast'

export function TaskList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', page, searchQuery, statusFilter],
    queryFn: () =>
      tasksApi
        .list({
          page,
          limit: 10,
        })
        .then((res) => res.data),
    // refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  })

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete task')
    },
  })

  const getStatusIcon = (
    is_done_created_doc: boolean,
    error_message: string | undefined
  ) => {
    if (!error_message) {
      return is_done_created_doc ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <LoadingSpinner size="sm" className="text-blue-500" />
      )
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: string) => {
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
    return <LoadingCard message="Loading tasks..." />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Manage your processing tasks</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search tasks..."
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
          {tasksData?.list?.length ? (
            <div className="space-y-4">
              {tasksData.list.map((task: Task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex flex-1 items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(
                        task.is_done_created_doc,
                        task.error_message
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium">{task.topic}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatRelativeTime(task.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/tasks/${task._id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {task.is_done_created_doc && !task.error_message && (
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/matching?task=${task._id}`)
                            }
                          >
                            <Search className="mr-2 h-4 w-4" />
                            Start Matching
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteMutation.mutate(task._id)}
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

              {tasksData.total_pages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * 10 + 1} to{' '}
                    {Math.min(page * 10, tasksData.total)} of {tasksData.total}{' '}
                    tasks
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
                      disabled={page >= tasksData.total_pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <ListTodo className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                No tasks found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Create your first task to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
