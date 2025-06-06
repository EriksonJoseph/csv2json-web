'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { tasksApi, filesApi } from '@/lib/api'
import { LoadingButton } from '@/components/ui/loading'
import { TaskCreateRequest } from '@/types'
import toast from 'react-hot-toast'
import { FileUpload } from '@/components/files/file-upload'

const taskSchema = z.object({
  topic: z.string().min(1, 'Task name is required'),
  created_file_date: z.string().min(1, 'Create file date is required'),
  updated_file_date: z.string().min(1, 'Update file date is required'),
  references: z.string().optional(),
  file_id: z.string().min(1, 'Please select a file'),
})

type TaskForm = z.infer<typeof taskSchema>

interface TaskCreateProps {
  onSuccess?: () => void
}

export function TaskCreate({ onSuccess }: TaskCreateProps) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: filesData } = useQuery({
    queryKey: ['files'],
    queryFn: () => filesApi.list({ per_page: 100 }).then((res) => res.data),
    enabled: isOpen,
  })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      topic: '',
      created_file_date: '',
      updated_file_date: '',
      references: '',
      file_id: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: TaskCreateRequest) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created successfully!')
      reset()
      setIsOpen(false)
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task')
    },
  })

  const onSubmit = async (data: TaskForm) => {
    createMutation.mutate(data)
  }

  const setFileId = (data: any) => {
    setValue('file_id', data._id)
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create Task
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader className="border-0 border-red-500">
        <CardTitle>Create New Task</CardTitle>
        <CardDescription>
          Create a processing task for your uploaded file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              placeholder="Enter task name"
              {...register('topic')}
              className={errors.topic ? 'border-red-500' : ''}
            />
            {errors.topic && (
              <p className="text-sm text-red-500">{errors.topic.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="created_file_date">Create file date *</Label>
              <Input
                id="created_file_date"
                type="date"
                placeholder="Select start date"
                {...register('created_file_date')}
                className={errors.created_file_date ? 'border-red-500' : ''}
              />
              {errors.created_file_date && (
                <p className="text-sm text-red-500">
                  {errors.created_file_date.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="updated_file_date">Update file date *</Label>
              <Input
                id="updated_file_date"
                type="date"
                placeholder="Select end date"
                {...register('updated_file_date')}
                className={errors.updated_file_date ? 'border-red-500' : ''}
              />
              {errors.updated_file_date && (
                <p className="text-sm text-red-500">
                  {errors.updated_file_date.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="references">References</Label>
            <Textarea
              id="references"
              placeholder="Optional description for the task"
              {...register('references')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">File ID</Label>
            <Input
              id="file_id"
              placeholder="Enter task name"
              {...register('file_id')}
              disabled
            />
          </div>

          <FileUpload afterSuccess={(data) => setFileId(data)} />

          <div className="flex items-center space-x-2 pt-4">
            {/* <Button type="submit" disabled={createMutation.isPending}> */}
            <Button type="submit">
              <LoadingButton isLoading={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Task'}
              </LoadingButton>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                reset()
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
