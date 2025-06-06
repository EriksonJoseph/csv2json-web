'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Eye, Plus, Edit, Settings } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { watchlistsApi } from '@/lib/api'

interface WatchlistItem {
  _id: string
  name: string
  description: string
  symbol: string
  price: number
  change: number
  changePercent: number
  category: string
  isActive: boolean
  lastUpdated: string
  watcherCount: number
}

export default function WatchListPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(9)
  const router = useRouter()

  const { data: watchlistsData, isLoading } = useQuery({
    queryKey: ['watchlists', page, searchQuery, perPage],
    queryFn: () =>
      watchlistsApi
        .list({
          page,
          per_page: perPage,
        })
        .then((res) => res?.data),
  })

  // Reset page when perPage changes
  const handlePerPageChange = (value: string) => {
    setPerPage(Number(value))
    setPage(1) // Reset to first page
  }

  console.log(`🚀🙈 TORPONG [page.tsx] watchlistsData`, watchlistsData)

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
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * perPage + 1} to{' '}
                  {Math.min(page * perPage, watchlistsData.total)} of{' '}
                  {watchlistsData.total} watchlists
                </p>
                <Select
                  value={perPage.toString()}
                  onValueChange={handlePerPageChange}
                >
                  <SelectTrigger className="w-32">
                    <Settings className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1/page</SelectItem>
                    <SelectItem value="6">6/page</SelectItem>
                    <SelectItem value="9">9/page</SelectItem>
                    <SelectItem value="12">12/page</SelectItem>
                    <SelectItem value="15">15/page</SelectItem>
                    <SelectItem value="24">24/page</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from(
                      { length: Math.min(5, watchlistsData.total_pages) },
                      (_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      }
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= watchlistsData.total_pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
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
