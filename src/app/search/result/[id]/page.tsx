'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, XCircle } from 'lucide-react'
import TaskInfo from '@/components/tasks/task-info'
import SearchCriteria from '@/components/search/search-criteria'
import SearchResultsTable from '@/components/search/search-results-table'

export default function MatchingResultPage() {
  const params = useParams()
  const router = useRouter()
  const searchId = params.id as string

  // Fetch matching result with polling for async searches
  const { data: result, error } = useQuery({
    queryKey: ['matching-result', searchId],
    queryFn: () => searchApi.getResult(searchId).then((res) => res.data),
    enabled: !!searchId,
    // refetchInterval: 2000, // Poll every 2 seconds
    // refetchOnWindowFocus: false,
  })

  const taskData = result?.task_detail

  // #region Handle error
  if (error || !result || result.status === 'failed') {
    const errorMessage =
      result?.error_message || 'Failed to load matching results'

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/search')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Error</h1>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>
          </div>
          {result?.status === 'failed' && (
            <Badge
              variant="outline"
              className="border-red-200 bg-red-50 text-red-700"
            >
              <XCircle className="mr-1 h-3 w-3" />
              Failed
            </Badge>
          )}
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <h3 className="mb-2 text-lg font-medium">Search Failed</h3>
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button className="mt-4" onClick={() => router.push('/tasks')}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  // #endregion

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/search')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Searching Results
            </h1>
            <div className="flex space-x-2">
              <p className="text-muted-foreground">Search ID: {result._id}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Task Information Section */}
      {taskData && <TaskInfo task={taskData} />}

      {/* Search Criteria Section */}
      {result && (
        <SearchCriteria
          columnNames={result.column_names}
          columnOptions={result.column_options}
        />
      )}

      {/* Search Results Table Section */}
      {result && (
        <SearchResultsTable
          results={result.results}
          columnNames={result.column_names}
          totalSearched={result.total_searched}
          resultsFound={result.results_found}
        />
      )}
    </div>
  )
}
