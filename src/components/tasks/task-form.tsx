'use client'

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
import { tasksApi } from '@/lib/api'
import { LoadingButton } from '@/components/ui/loading'
import { TaskCreateRequest } from '@/types'
import toast from 'react-hot-toast'
import { FileUpload } from '@/components/files/file-upload'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// #region จัดการ form
const taskSchema = z.object({
  topic: z.string().min(1, 'Task name is required'),
  created_file_date: z.string().min(1, 'Create file date is required'),
  updated_file_date: z.string().min(1, 'Update file date is required'),
  references: z.string().optional(),
  file_id: z.string().min(1, 'Please select a file'),
})

type TaskForm = z.infer<typeof taskSchema>
// #endregion

interface TaskFormProps {
  taskId?: string
  mode?: 'create' | 'edit' | 'view'
  onSuccess?: () => void
}

export function TaskForm({
  taskId,
  mode = 'create',
  onSuccess,
}: TaskFormProps) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: taskData } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.get(taskId!).then((res) => res.data),
    enabled: mode === 'edit' && !!taskId,
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

  useEffect(() => {
    if (mode === 'edit' && taskData) {
      setValue('topic', taskData.topic || '')
      setValue('created_file_date', taskData.created_file_date || '')
      setValue('updated_file_date', taskData.updated_file_date || '')
      setValue('references', taskData.references || '')
      setValue('file_id', taskData.file_id || '')
    }
  }, [taskData, mode, setValue])

  const createMutation = useMutation({
    mutationFn: (data: TaskCreateRequest) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created successfully!')
      reset()
      onSuccess?.() || router.push('/auth/tasks')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task')
    },
  })

  const onSubmit = async (data: TaskForm) => {
    if (!data.file_id) {
      toast.error('Please upload a file to get file ID before creating task')
      return
    }

    if (mode === 'edit') {
    } else {
      createMutation.mutate(data)
    }
  }

  const [uploadedFile, setUploadedFile] = useState<any>(null)

  const setFileId = (data: any) => {
    setValue('file_id', data._id)
    setUploadedFile(data)
  }

  const clearFile = () => {
    setValue('file_id', '')
    setUploadedFile(null)
  }

  const isLoading = createMutation.isPending

  return (
    <Card className="pt-4">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              placeholder="Enter task name"
              disabled={mode == 'view'}
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
                disabled={mode == 'view'}
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
                disabled={mode == 'view'}
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
              disabled={mode == 'view'}
              {...register('references')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file_id">File ID</Label>
            <Input
              id="file_id"
              placeholder="File ID will appear after upload"
              {...register('file_id')}
              disabled
            />
            {errors.file_id && (
              <p className="text-sm text-red-500">{errors.file_id.message}</p>
            )}
          </div>

          {mode === 'create' && (
            <FileUpload
              afterSuccess={(data) => setFileId(data)}
              onClearFile={clearFile}
              uploadedFile={uploadedFile}
              maxFiles={1}
              maxSize={25 * 1024 * 1024} // 25MB
            />
          )}

          <div className="flex items-center space-x-2 pt-4">
            {mode === 'create' && (
              <Button type="submit" disabled={isLoading}>
                <LoadingButton isLoading={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Task'}
                </LoadingButton>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/auth/tasks')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
