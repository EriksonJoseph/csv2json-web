'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { matchingApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Clock,
  Target,
  Users,
  TrendingUp,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Database,
  Hash,
} from 'lucide-react'
import { useState } from 'react'
import { MatchedRecord, MatchedResultResponse } from '@/types'
import { onlyUnique } from '@/lib/utils'

export default function MatchingResultPage() {
  const params = useParams()
  const router = useRouter()
  const searchId = params.id as string
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('with-matches')

  // Fetch matching result with polling for async searches
  const {
    data: result,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['matching-result', searchId],
    queryFn: () => matchingApi.getResult(searchId).then((res) => res.data),
    enabled: !!searchId,
    // refetchInterval: 2000, // Poll every 2 seconds
    // refetchOnWindowFocus: false,
  })

  console.log(`🚀🙈 TORPONG [page.tsx] result`, result)

  const toggleRowExpansion = (queryName: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(queryName)) {
      newExpandedRows.delete(queryName)
    } else {
      newExpandedRows.add(queryName)
    }
    setExpandedRows(newExpandedRows)
  }

  const getFilteredResults = () => {
    if (!result?.matched_result) return []

    switch (activeTab) {
      case 'with-matches':
        return result.matched_result.filter(
          (item) => (item.matched_record_number || 0) > 0
        )
      case 'no-matches':
        return result.matched_result.filter(
          (item) => (item.matched_record_number || 0) === 0
        )
      case 'all':
      default:
        return result.matched_result
    }
  }

  const getCounts = () => {
    if (!result?.matched_result)
      return { withMatches: 0, noMatches: 0, total: 0 }

    const withMatches = result.matched_result.filter(
      (item) => (item.matched_record_number || 0) > 0
    ).length
    const noMatches = result.matched_result.filter(
      (item) => (item.matched_record_number || 0) === 0
    ).length
    const total = result.matched_result.length

    return { withMatches, noMatches, total }
  }

  const renderMatchedColumnValue = (matchRecords: MatchedRecord[]) => {
    const uniqeColumnName = matchRecords
      .map((item) => item.matched_column)
      .filter(onlyUnique)

    return uniqeColumnName.map((columName, index) => {
      const columnMatches =
        matchRecords?.filter((value) => value.matched_column === columName) ||
        []
      const avgConfidence =
        columnMatches.length > 0
          ? columnMatches.reduce((sum, record) => sum + record.confidence, 0) /
            columnMatches.length
          : 0

      return (
        <Card
          className="group border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-blue-950/20 dark:to-indigo-950/10"
          key={`column-name-${index}`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="text-blue-900 dark:text-blue-100">
                {columName || 'Unknown Column'}
              </span>
              <Badge
                variant="outline"
                className="ml-auto border-blue-200 bg-white/80 text-xs"
              >
                {avgConfidence.toFixed(1)}% avg
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                <span>
                  {columnMatches.length} match
                  {columnMatches.length !== 1 ? 'es' : ''}
                </span>
              </div>
              <div className="max-h-32 space-y-1 overflow-y-auto">
                {columnMatches.map((mValue, mIndex) => (
                  <div
                    key={`matched-name-${mIndex}`}
                    className="group/item flex items-center justify-between rounded-md border border-blue-100/50 bg-white/60 p-2 text-sm transition-colors hover:bg-white/80 dark:border-gray-700/50 dark:bg-gray-800/40 dark:hover:bg-gray-800/60"
                  >
                    <span className="truncate font-medium text-gray-700 dark:text-gray-200">
                      {mValue.matched_value}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-xs text-blue-700 opacity-70 transition-opacity group-hover/item:opacity-100 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {mValue.confidence.toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )
    })
  }

  const renderMatchedTable = (data: MatchedResultResponse[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          No query matches available for this filter
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="w-12 p-4"></th>
              <th className="p-4 text-left font-medium">Query Name</th>
              <th className="p-4 text-right font-medium">Matched Records</th>
            </tr>
          </thead>
          <tbody>
            {data.map((matched, index) => {
              const uniqueKey = `${matched.query_name}-${index}`
              return (
                <React.Fragment key={uniqueKey}>
                  <tr
                    className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                    onClick={() => toggleRowExpansion(uniqueKey)}
                  >
                    <td className="p-4">
                      {expandedRows.has(uniqueKey) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {matched.query_name || ''}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`text-lg font-bold ${
                          (matched?.matched_record_number || 0) > 0
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {matched?.matched_record_number || 0}
                      </span>
                    </td>
                  </tr>
                  {expandedRows.has(uniqueKey) && (
                    <tr>
                      <td colSpan={3} className="bg-muted/20 p-0">
                        <div className="space-y-2 p-4">
                          <div className="mb-3 text-sm font-medium text-muted-foreground">
                            Matched Columns:
                          </div>
                          {matched.matched_records &&
                          matched.matched_records.length > 0 ? (
                            <div className="grid gap-1 md:grid-cols-2 lg:grid-cols-3">
                              {renderMatchedColumnValue(
                                matched.matched_records
                              )}
                            </div>
                          ) : (
                            <div className="text-sm italic text-muted-foreground">
                              No detailed matches available
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const getStatusDisplay = () => {
    if (!result?.status) return null

    switch (result.status) {
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
              onClick={() => router.push('/matching')}
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
            <Button
              className="mt-4"
              onClick={() => router.push('/matching/form')}
            >
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
            onClick={() => router.push('/matching')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Matching Results
            </h1>
            <div className="flex space-x-2">
              <p className="text-muted-foreground">Search ID: {result._id}</p>
              {getStatusDisplay() && (
                <div className="flex items-center space-x-2">
                  {getStatusDisplay()}
                </div>
              )}
            </div>
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
              <p className="text-sm text-muted-foreground">
                {result.query_names.length.toLocaleString() || 0}
              </p>
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

      {/* Query Summary with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Query Summary ({getCounts().total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="with-matches" className="relative">
                Matchs
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getCounts().withMatches}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="no-matches" className="relative">
                No Matchs
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getCounts().noMatches}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="all" className="relative">
                All
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getCounts().total}
                </Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="with-matches" className="mt-4">
              {renderMatchedTable(getFilteredResults())}
            </TabsContent>
            <TabsContent value="no-matches" className="mt-4">
              {renderMatchedTable(getFilteredResults())}
            </TabsContent>
            <TabsContent value="all" className="mt-4">
              {renderMatchedTable(getFilteredResults())}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
