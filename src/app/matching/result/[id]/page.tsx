'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { matchingApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Search,
  Clock,
  Target,
  Users,
  TrendingUp,
  Download,
  Filter,
} from 'lucide-react'

export default function MatchingResultPage() {
  const params = useParams()
  const router = useRouter()
  const searchId = params.id as string
  const [filterTerm, setFilterTerm] = useState('')

  // Fetch matching result
  const {
    data: result,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['matching-result', searchId],
    queryFn: () => matchingApi.getResult(searchId).then((res) => res.data),
    enabled: !!searchId,
  })

  console.log(`🚀🙈 TORPONG [page.tsx] result`, result)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
            <p className="text-muted-foreground">
              Fetching matching results...
            </p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Error</h1>
              <p className="text-muted-foreground">
                Failed to load matching results
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">No results found</h3>
            <p className="text-muted-foreground">
              The requested matching result could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800'
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/matching')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Matching Results
            </h1>
            <p className="text-muted-foreground">Search ID: {result._id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Query Names
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result?.query_names?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">total search names</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Results Found</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.total_found}</div>
            <p className="text-xs text-muted-foreground">
              out of {result.total_found} searched
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Execution Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((result.execution_time_ms || 0) / 1000)} s
            </div>
            <p className="text-xs text-muted-foreground">processing time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threshold</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.threshold_used}%</div>
            <p className="text-xs text-muted-foreground">minimum confidence</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Info */}
      <Card>
        <CardHeader>
          <CardTitle>Search Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Search Type</Label>
              <p className="text-sm text-muted-foreground">
                {result.search_type}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Columns Used</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {result.columns_used.map((column, index) => (
                  <Badge key={index} variant="outline">
                    {column}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Query Names</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {result.query_names.map((query, index) => (
                  <Badge key={index} variant="secondary">
                    {query}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Total Rows</Label>
              <p className="text-sm text-muted-foreground">
                {result.total_rows.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Matched Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Query Matched Summary ({result.total_found || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Query Name</th>
                  <th className="p-4 text-right font-medium">
                    Matched Records
                  </th>
                </tr>
              </thead>
              <tbody>
                {result?.matched_result?.map((matched, index) => (
                  <tr
                    key={index}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-2">
                      <div className="font-medium">
                        {matched.query_name || ''}
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <span className="text-lg font-bold text-green-600">
                        {matched?.matched_record_number || 0}
                      </span>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No query matches available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
