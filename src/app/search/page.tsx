'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Eye,
  Plus,
  Search,
  Trash,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { getPagiantionRowNumber } from '@/lib/utils'
import { searchApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function MatchingPage() {
  const router = useRouter()
  const [searchQuery] = useState('')
  const queryClient = useQueryClient()

  // #region pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(9)
  // #endregion

  // #region API
  const { data: histories, isLoading } = useQuery({
    queryKey: ['search_history', page, limit],
    queryFn: () => {
      return searchApi.list({ page, limit }).then((res) => res.data)
    },
    refetchInterval: 5000,
  })

  const deleteMutation = useMutation({
    mutationFn: (searchId: string) => searchApi.delete(searchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search_history'] })
      toast.success('Search deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete search')
    },
  })
  // #endregion

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="border-yellow-200 bg-yellow-50 text-yellow-700"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case 'processing':
        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-blue-700"
          >
            <AlertCircle className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        )
      case 'completed':
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-green-700"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case 'failed':
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 text-red-700"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Matching</h1>
            <p className="text-muted-foreground">Loading History...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">
            Searching Result
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <h2>Your Search histories</h2>
          </div>
        </CardHeader>
        <CardContent>
          {histories?.list?.length ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {histories.list.map((history, idx: number) => (
                  <Card
                    key={history._id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h3>
                          {`${getPagiantionRowNumber({ page, limit, index: idx })}. `}
                          {history?.created_at
                            ? dayjs(history.created_at).format('YY/MM/DD HH:mm')
                            : '-'}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(history.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Task Topic:
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="font-medium">
                              {history.task_topic || '-'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            File Name:
                          </span>
                          <span className="font-medium">
                            {history.original_filename || '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Total Query:
                          </span>
                          <span className="font-medium">
                            {history.total_queries || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Total Rows:
                          </span>
                          <span className="font-medium">
                            {history.total_rows.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Process Time:
                          </span>
                          <span className="font-medium">
                            {history?.processing_time?.toFixed(2) || 0} s
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between space-x-2">
                      {['failed', 'completed'].includes(
                        history.status || ''
                      ) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              router.push(`/search/result/${history._id}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Results
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-red-500"
                            onClick={() => deleteMutation.mutate(history._id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium">No history found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No history found matching "${searchQuery}"`
                  : 'Create your first matching to get started'}
              </p>
              {!searchQuery && (
                <Button
                  className="mt-4"
                  onClick={() => router.push('/matching/form')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Matching
                </Button>
              )}
            </div>
          )}
          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalItems={histories?.total || 0}
            itemsPerPage={limit}
            onPageChange={setPage}
            onItemsPerPageChange={(newPerPage) => {
              setLimit(newPerPage)
              setPage(1)
            }}
            itemsPerPageOptions={[1, 6, 9, 12, 15, 24]}
            className="pt-4"
          />
        </CardContent>
      </Card>
    </div>
  )
}
