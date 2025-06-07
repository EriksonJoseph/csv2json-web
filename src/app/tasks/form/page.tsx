'use client'

import { TaskForm } from '@/components/tasks/task-form'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TaskCreatePage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Task</h1>
          <p className="text-muted-foreground">
            Create a new data processing task
          </p>
        </div>
      </div>
      <TaskForm mode="create" onSuccess={() => router.push('/tasks')} />
    </div>
  )
}
