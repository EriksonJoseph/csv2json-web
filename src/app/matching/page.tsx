'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { matchingApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MatchingPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: matchingList, isLoading } = useQuery({
    queryKey: ['matching_list'],
    queryFn: () => {
      return matchingApi
        .getHistory({ page: 1, limit: 10 })
        .then((res) => res.data)
    },
  })

  console.log(`🚀🙈 TORPONG [page.tsx] matchingList`, matchingList)

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
            <span>todo</span>
          </div>
        </CardHeader>
        <CardContent>
          {matchingList?.list?.length ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {matchingList.list.map((history, idx: number) => (
                  <Card
                    key={history.search_id}
                    className="transition-shadow hover:shadow-md"
                  ></Card>
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
        </CardContent>
      </Card>
    </div>
  )
}
