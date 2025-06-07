'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save } from 'lucide-react'
import { watchlistsApi } from '@/lib/api'
import { LoadingButton } from '@/components/ui/loading'
import toast from 'react-hot-toast'
import { WatchlistCreateRequest } from '@/types'

const watchlistSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  list: z.string().min(1, 'List is required'),
})

type WatchlistForm = z.infer<typeof watchlistSchema>

export default function WatchListFormPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WatchlistForm>({
    resolver: zodResolver(watchlistSchema),
    defaultValues: {
      title: '',
      list: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: WatchlistCreateRequest) => {
      return watchlistsApi.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      toast.success('Watchlist created successfully!')
      router.push('/watchlists')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create watchlist')
    },
  })

  const onSubmit = async (data: WatchlistForm) => {
    const submitData: WatchlistCreateRequest = {
      ...data,
      list: data.list.split('\n'),
    }
    createMutation.mutate(submitData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Watchlist
          </h1>
          <p className="text-muted-foreground">
            Create a new watchlist for name matching
          </p>
        </div>
      </div>

      <Card className="pt-4">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter watchlist title"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="list">List *</Label>
              <Textarea
                id="list"
                placeholder="Enter names, one per line&#10;John Doe&#10;Jane Smith&#10;Bob Johnson"
                rows={10}
                {...register('list')}
                className={errors.list ? 'border-red-500' : ''}
              />
              {errors.list && (
                <p className="text-sm text-red-500">{errors.list.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Enter each name on a separate line. Empty lines will be ignored.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Button type="submit" disabled={createMutation.isPending}>
                <LoadingButton isLoading={createMutation.isPending}>
                  <div className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    {createMutation.isPending
                      ? 'Creating...'
                      : 'Create Watchlist'}
                  </div>
                </LoadingButton>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
