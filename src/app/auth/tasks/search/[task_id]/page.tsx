'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { isValidObjectId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import TaskSearch from '@/components/tasks/task-search'
import TaskInfo from '@/components/tasks/task-info'
import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api'

export default function TaskSearchPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.task_id as string

  useEffect(() => {
    if (!taskId || !isValidObjectId(taskId)) {
      router.replace('/auth/tasks')
    }
  }, [taskId, router])

  const { data: taskData } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.get(taskId!).then((res) => res.data),
    enabled: !!taskId,
  })

  const onCreateSearchSuccess = () => {
    router.push('/auth/search')
  }

  if (!taskData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading task information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Search From CSV file
        </h1>
      </div>

      {/* Task Information Section */}
      <TaskInfo task={taskData} />

      {/* Search Form Section */}
      <TaskSearch task={taskData} onSuccess={onCreateSearchSuccess} />
    </div>
  )
}
