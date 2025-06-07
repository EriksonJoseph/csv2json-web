'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Eye, Plus, Edit } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import { watchlistsApi } from '@/lib/api'

export default function WatchListPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(9)
  const router = useRouter()

  const { data: watchlistsData, isLoading } = useQuery({
    queryKey: ['watchlists', page, searchQuery, limit],
    queryFn: () => {
      const body = {
        page,
        limit: limit,
      }
      return watchlistsApi.list(body).then((res) => res?.data)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Watchlists</h1>
            <p className="text-muted-foreground">Loading watchlists...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Watchlists</h1>
          <p className="text-muted-foreground">
            Preset of name use in Matching
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push('/watchlists/form')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Watch List
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search watchlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {watchlistsData?.list?.length ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {watchlistsData.list.map((item) => (
                  <Card
                    key={item._id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="pb-3">
                      {item.title || '-'}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ul>
                        {item.list.map((name, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-muted-foreground"
                          >
                            {name}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          router.push(`/watchlists/form/${item._id}?mode=view`)
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          router.push(`/watchlists/form/${item._id}?mode=edit`)
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalItems={watchlistsData.total}
                itemsPerPage={limit}
                onPageChange={setPage}
                onItemsPerPageChange={(newPerPage) => {
                  setLimit(newPerPage)
                  setPage(1)
                }}
                itemsPerPageOptions={[1, 6, 9, 12, 15, 24]}
                className="pt-4"
              />
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium">No watchlists found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No watchlists found matching "${searchQuery}"`
                  : 'Create your first watchlist to get started'}
              </p>
              {!searchQuery && (
                <Button
                  className="mt-4"
                  onClick={() => router.push('/watchlists/form')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Watchlist
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
