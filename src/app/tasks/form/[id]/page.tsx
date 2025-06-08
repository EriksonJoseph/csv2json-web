'use client'

import { TaskForm } from '@/components/tasks/task-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'

export default function TaskEditPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const taskId = params.id as string
  const mode = (searchParams.get('mode') as 'view' | 'edit') || 'edit'

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === 'view' ? 'View Task' : 'Edit Task'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'view'
              ? 'View task details'
              : 'Update your data processing task'}
          </p>
        </div>
      </div>
      <TaskForm
        taskId={taskId}
        mode={mode}
        onSuccess={() => router.push('/tasks')}
      />
    </div>
  )
}
