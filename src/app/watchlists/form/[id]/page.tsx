'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
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
import { ArrowLeft, Save } from 'lucide-react'
import { watchlistsApi } from '@/lib/api'
import { LoadingButton, LoadingCard } from '@/components/ui/loading'
import toast from 'react-hot-toast'
import { WatchlistCreateRequest, WatchlistUpdateRequest } from '@/types'

const watchlistSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  list: z.string().min(1, 'List is required'),
})

type WatchlistForm = z.infer<typeof watchlistSchema>

export default function WatchlistEditFormPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const watchlistId = params.id as string
  const mode = searchParams.get('mode') || 'edit'

  console.log(`🚀🙈 TORPONG [page.tsx] params`, params)
  console.log(`🚀🙈 TORPONG [page.tsx] mode`, mode)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WatchlistForm>({
    resolver: zodResolver(watchlistSchema),
    defaultValues: {
      title: '',
      list: '',
    },
  })

  // Fetch existing watchlist data
  const { data: watchlistData, isLoading: isLoadingWatchlist } = useQuery({
    queryKey: ['watchlist', watchlistId],
    queryFn: () => watchlistsApi.get(watchlistId),
    enabled: !!watchlistId,
  })

  // Set form values when data is loaded
  useEffect(() => {
    if (watchlistData?.data) {
      const watchlist = watchlistData.data
      setValue('title', watchlist.title || '')
      setValue(
        'list',
        Array.isArray(watchlist.list) ? watchlist.list.join('\n') : ''
      )
    }
  }, [watchlistData, setValue])

  const updateMutation = useMutation({
    mutationFn: (data: WatchlistUpdateRequest) => {
      return watchlistsApi.update(watchlistId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      queryClient.invalidateQueries({ queryKey: ['watchlist', watchlistId] })
      toast.success('Watchlist updated successfully!')
      router.push('/watchlists')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update watchlist')
    },
  })

  const onSubmit = async (data: WatchlistForm) => {
    const submitData: WatchlistUpdateRequest = {
      ...data,
      _id: watchlistId,
      list: data.list
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    }
    updateMutation.mutate(submitData)
  }

  if (isLoadingWatchlist) {
    return <LoadingCard message="Loading watchlist..." />
  }

  if (!watchlistData?.data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Watchlist Not Found
            </h1>
            <p className="text-muted-foreground">
              The requested watchlist could not be found.
            </p>
          </div>
        </div>
      </div>
    )
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
            {mode === 'view' ? 'View Watchlist' : 'Edit Watchlist'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'view'
              ? 'View your watchlist details'
              : 'Update your watchlist for name matching'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Watchlist Information</CardTitle>
          <CardDescription>
            Update the title and list of names for your watchlist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter watchlist title"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
                disabled={mode === 'view'}
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
                disabled={mode === 'view'}
              />
              {errors.list && (
                <p className="text-sm text-red-500">{errors.list.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Enter each name on a separate line. Empty lines will be ignored.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              {mode !== 'view' && (
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center"
                >
                  <LoadingButton isLoading={updateMutation.isPending}>
                    <div className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      {updateMutation.isPending
                        ? 'Updating...'
                        : 'Update Watchlist'}
                    </div>
                  </LoadingButton>
                </Button>
              )}
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
