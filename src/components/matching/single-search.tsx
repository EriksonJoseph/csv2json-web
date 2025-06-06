'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
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
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Search, Download, Clock } from 'lucide-react'
import { matchingApi } from '@/lib/api'
import { SearchRequest, SearchResult } from '@/types'
import { copyToClipboard } from '@/lib/utils'
import { LoadingButton } from '@/components/ui/loading'
import toast from 'react-hot-toast'

const searchSchema = z.object({
  search_term: z.string().min(1, 'Search term is required'),
  threshold: z.number().min(0).max(100),
  limit: z.number().min(1).max(1000),
})

type SearchForm = z.infer<typeof searchSchema>

interface SingleSearchProps {
  taskId: string
  columnName: string
}

export function SingleSearch({ taskId, columnName }: SingleSearchProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchTime, setSearchTime] = useState<number>(0)
  const [totalMatches, setTotalMatches] = useState<number>(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search_term: '',
      threshold: 80,
      limit: 100,
    },
  })

  const threshold = watch('threshold')
  const limit = watch('limit')

  const searchMutation = useMutation({
    mutationFn: (data: SearchRequest) => matchingApi.search(data),
    onSuccess: (response) => {
      const { results, search_time, total_matches } = response.data
      setResults(results)
      setSearchTime(search_time)
      setTotalMatches(total_matches)
      toast.success(
        `Found ${total_matches} matches in ${search_time.toFixed(2)}ms`
      )
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Search failed')
    },
  })

  const onSubmit = (data: SearchForm) => {
    const searchRequest: SearchRequest = {
      task_id: taskId,
      column_name: columnName,
      search_term: data.search_term,
      threshold: data.threshold / 100, // Convert percentage to decimal
      limit: data.limit,
    }
    searchMutation.mutate(searchRequest)
  }

  const exportResults = () => {
    if (results.length === 0) {
      toast.error('No results to export')
      return
    }

    const csvContent = [
      'Value,Score,Row Index',
      ...results.map(
        (result) =>
          `"${result.value}",${result.score.toFixed(4)},${result.row_index}`
      ),
    ].join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `search-results-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast.success('Results exported successfully')
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.9)
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (score >= 0.8)
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    if (score >= 0.7)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Single Search</CardTitle>
          <CardDescription>
            Search for similar values using fuzzy matching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search_term">Search Term</Label>
              <Input
                id="search_term"
                placeholder="Enter the term to search for"
                {...register('search_term')}
                className={errors.search_term ? 'border-red-500' : ''}
              />
              {errors.search_term && (
                <p className="text-sm text-red-500">
                  {errors.search_term.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Similarity Threshold: {threshold}%</Label>
                <Slider
                  value={[threshold]}
                  onValueChange={(value) => setValue('threshold', value[0])}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher values return more precise matches
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Maximum Results</Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="1000"
                  {...register('limit', { valueAsNumber: true })}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={searchMutation.isPending}
              className="w-full"
            >
              {searchMutation.isPending ? (
                <LoadingButton isLoading={true}>
                  Searching...
                </LoadingButton>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Found {totalMatches} matches in {searchTime.toFixed(2)}ms
                </CardDescription>
              </div>
              <Button onClick={exportResults} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                  onClick={() => {
                    copyToClipboard(result.value)
                    toast.success('Value copied to clipboard')
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{result.value}</p>
                    <p className="text-sm text-muted-foreground">
                      Row {result.row_index}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="w-16">
                        <Progress value={result.score * 100} className="h-2" />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {(result.score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <Badge className={getScoreColor(result.score)}>
                      {(result.score * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {totalMatches > results.length && (
              <div className="mt-4 rounded-lg bg-muted p-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Showing top {results.length} of {totalMatches} matches. Adjust
                  the limit or threshold to see more results.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
