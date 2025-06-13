'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { matchingApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
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
import { useRouter, useSearchParams } from 'next/navigation'
import dayjs from 'dayjs'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { getPagiantionRowNumber } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function MatchingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery] = useState('')

  // #region pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(9)
  // #endregion

  // #region API
  const { data: histories, isLoading } = useQuery({
    queryKey: ['matching_list', page, limit],
    queryFn: () => {
      return matchingApi.getHistory({ page, limit }).then((res) => res.data)
    },
    refetchInterval: 2000,
  })
  // #endregion

  const getSearchTypeBadge = (type: string | undefined) => {
    if (type === 'single') {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Single
        </Badge>
      )
    }
    if (type === 'bulk') {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Bluk
        </Badge>
      )
    }
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Fuzzy Matching</h1>
          <p className="text-muted-foreground">
            Search for similar values in your processed data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push('/matching/form')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Matching
          </Button>
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
                          {getSearchTypeBadge(history.search_type)}
                          {getStatusBadge(history.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {history.watchlist_title && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Watchlist:
                            </span>
                            <span className="font-medium">
                              {history.watchlist_title || '-'}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Query Names:
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="font-medium">
                              {history.query_name_length || '-'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Results Found:
                          </span>
                          <span className="font-medium">
                            {history.results_found || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Threshold:
                          </span>
                          <span className="font-medium">
                            {history.threshold_used || '-'}
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
                              router.push(`/matching/result/${history._id}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Results
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-red-500"
                            onClick={() => alert('todo delete')}
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
