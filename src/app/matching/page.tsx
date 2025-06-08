'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { matchingApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { Eye, Plus, Search, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { getPagiantionRowNumber } from '@/lib/utils'

export default function MatchingPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

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
                        {getSearchTypeBadge(history.search_type)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Query Names:
                          </span>
                          <span className="font-medium">
                            {history.query_names || '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Results Found:
                          </span>
                          <Badge variant="outline" className="font-medium">
                            {history.results_found || 0}
                          </Badge>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          router.push(`/matching/result/${history._id}`)
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
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
