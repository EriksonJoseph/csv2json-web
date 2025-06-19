'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Eye,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { tasksApi } from '@/lib/api'
import { Task } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export default function TasksPage() {
  // #region Hook
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(9)
  const router = useRouter()
  const queryClient = useQueryClient()
  // #endregion

  // #region API
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', page, searchQuery, limit],
    queryFn: () => {
      return tasksApi
        .list({
          page,
          limit,
        })
        .then((res) => res.data)
    },
    refetchInterval: 5000,
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
  // #endregion

  // #region get display element
  const getStatusIcon = (
    is_done_created_doc: boolean,
    error_message: string | undefined
  ) => {
    if (!error_message) {
      return is_done_created_doc ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <Clock className="h-4 w-4 text-blue-500" />
      )
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (
    is_done_created_doc: boolean,
    error_message: string | undefined
  ) => {
    if (error_message) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Failed
        </Badge>
      )
    }
    if (is_done_created_doc) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Completed
        </Badge>
      )
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        Processing
      </Badge>
    )
  }
  // #endregion

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Create and manage your data processing tasks
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push('/auth/tasks/form')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          {/* implement search later */}
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
          </div> */}
        </CardHeader>
        <CardContent>
          {tasksData?.list?.length ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasksData.list.map((task: Task) => (
                  <Card
                    key={task._id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="truncate font-medium">
                          {task.topic || '-'}
                        </h3>
                        {getStatusIcon(
                          task.is_done_created_doc,
                          task.error_message
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(
                          task.is_done_created_doc,
                          task.error_message
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Created: {formatRelativeTime(task.created_at)}</p>
                        {task.error_message && (
                          <p className="mt-1 text-red-500">
                            Error: {task.error_message}
                          </p>
                        )}
                        <p>Total columns: {task.total_columns || '-'}</p>
                        <p>Total rows: {task.total_rows || '-'}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between space-x-2 p-2">
                      {task.is_done_created_doc && !task.error_message && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="flex-1"
                            onClick={() =>
                              router.push(`/auth/tasks/search/${task._id}`)
                            }
                          >
                            <Search className="mr-2 h-4 w-4" />
                            Search
                          </Button>
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="xl:hidden"
                            onClick={() =>
                              router.push(
                                `/auth/tasks/form/${task._id}?mode=view`
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteMutation.mutate(task._id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalItems={tasksData.total}
                itemsPerPage={limit}
                onPageChange={setPage}
                onItemsPerPageChange={(newPerPage) => {
                  setLimit(newPerPage)
                  setPage(1)
                }}
                itemsPerPageOptions={[1, 6, 9, 12, 15, 24]}
                className="pt-4"
              />
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium">No tasks found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No tasks found matching "${searchQuery}"`
                  : 'Create your first task to get started'}
              </p>
              {!searchQuery && (
                <Button
                  className="mt-4"
                  onClick={() => router.push('/auth/tasks/form')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
