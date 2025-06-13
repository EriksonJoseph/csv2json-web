'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Download, Upload, FileText } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { matchingApi, watchlistsApi } from '@/lib/api'
import {
  BulkSearchRequest,
  BulkSearchResult,
  WatchlistMatchRequest,
} from '@/types'
import toast from 'react-hot-toast'
import { LoadingButton } from '@/components/ui/loading'
import { SearchableSelect } from '@/components/ui/searchable-select'

const bulkSearchSchema = z
  .object({
    search_terms_text: z.string().optional(),
    threshold: z.number().min(0).max(100),
    limit_per_term: z.number().min(1).max(100),
    search_method: z.enum(['manual', 'watchlist']),
    watchlist_id: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.search_method === 'manual') {
        return (
          data.search_terms_text && data.search_terms_text.trim().length > 0
        )
      }
      if (data.search_method === 'watchlist') {
        return data.watchlist_id && data.watchlist_id.length > 0
      }
      return false
    },
    {
      message: 'Please provide search terms or select a watchlist',
      path: ['search_terms_text'],
    }
  )

type BulkSearchForm = z.infer<typeof bulkSearchSchema>

interface BulkSearchProps {
  taskId: string
  columnName: string
}

export function BulkSearch({ taskId, columnName }: BulkSearchProps) {
  const [results, setResults] = useState<BulkSearchResult[]>([])
  const [searchTime, setSearchTime] = useState<number>(0)
  const [searchTermsFromFile, setSearchTermsFromFile] = useState<string[]>([])
  const [uploadedFileName, setUploadedFileName] = useState<string>('')

  // Fetch watchlists
  const { data: watchlistsData, isLoading: isLoadingWatchlists } = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => watchlistsApi.list().then((res) => res?.data),
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BulkSearchForm>({
    resolver: zodResolver(bulkSearchSchema),
    defaultValues: {
      search_terms_text: '',
      threshold: 80,
      limit_per_term: 10,
      search_method: 'manual',
      watchlist_id: '',
    },
  })

  const threshold = watch('threshold')
  const searchMethod = watch('search_method')
  const watchlistId = watch('watchlist_id')

  // Transform watchlists into options for the select
  const watchlistOptions =
    watchlistsData?.list.map((watchlist) => ({
      label: `${watchlist.title} (${watchlist.list.length} terms)`,
      value: watchlist._id,
    })) || []

  const searchMutation = useMutation({
    mutationFn: (data: BulkSearchRequest) => matchingApi.bulkSearch(data),
    onSuccess: (response) => {
      const { search_id, status } = response.data
      if (search_id) {
        toast.success('Bulk search submitted successfully!')
        // You may want to redirect to the results page or show status
        // For now, we'll just clear the results and show success
        setResults([])
        setSearchTime(0)
      } else {
        toast.error('No search ID returned from server')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Bulk search failed')
    },
  })

  const watchlistMatchMutation = useMutation({
    mutationFn: (data: WatchlistMatchRequest) => watchlistsApi.match(data),
    onSuccess: (response) => {
      const { matches, total_matches, search_time } = response.data
      // Convert watchlist matches to BulkSearchResult format
      const convertedResults: BulkSearchResult[] = matches.map((match) => ({
        search_term: match.watchlist_item.value,
        total_matches: match.matches.length,
        results: match.matches.map((m: any) => ({
          value: m.value,
          score: m.score,
          row_index: m.row_index,
        })),
      }))
      setResults(convertedResults)
      setSearchTime(search_time)
      toast.success(
        `Found ${total_matches} total matches in ${search_time.toFixed(2)}ms`
      )
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Watchlist search failed')
    },
  })

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text
          .split('\\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
        setSearchTermsFromFile(lines)
        setUploadedFileName(file.name)
        toast.success(`Loaded ${lines.length} search terms from ${file.name}`)
      }
      reader.readAsText(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  })

  const onSubmit = (data: BulkSearchForm) => {
    if (data.search_method === 'watchlist') {
      // Watchlist search
      if (!data.watchlist_id) {
        toast.error('Please select a watchlist')
        return
      }

      const watchlistRequest: WatchlistMatchRequest = {
        watchlist_id: data.watchlist_id,
        task_id: taskId,
        column_name: columnName,
        threshold: data.threshold / 100,
      }

      watchlistMatchMutation.mutate(watchlistRequest)
    } else {
      // Manual search (text input or file upload)
      let searchTerms: string[]

      if (searchTermsFromFile.length > 0) {
        searchTerms = searchTermsFromFile
      } else {
        searchTerms = (data.search_terms_text || '')
          .split('\\n')
          .map((term) => term.trim())
          .filter((term) => term.length > 0)
      }

      if (searchTerms.length === 0) {
        toast.error('Please provide search terms')
        return
      }

      const searchRequest: BulkSearchRequest = {
        task_id: taskId,
        columns: [columnName],
        list: searchTerms,
        threshold: data.threshold / 100,
      }

      searchMutation.mutate(searchRequest)
    }
  }

  const exportResults = () => {
    if (results.length === 0) {
      toast.error('No results to export')
      return
    }

    const csvContent = [
      'Search Term,Match Value,Score,Row Index',
      ...results.flatMap((result) =>
        result.results.map(
          (match) =>
            `"${result.search_term}","${match.value}",${match.score.toFixed(4)},${match.row_index}`
        )
      ),
    ].join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bulk-search-results-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast.success('Results exported successfully')
  }

  const clearFileData = () => {
    setSearchTermsFromFile([])
    setUploadedFileName('')
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Search</CardTitle>
          <CardDescription>
            Search for multiple terms at once using fuzzy matching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Search Method Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Search Terms Source
              </Label>
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="manual"
                    value="manual"
                    {...register('search_method')}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor="manual"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Manual Input
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="watchlist"
                    value="watchlist"
                    {...register('search_method')}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor="watchlist"
                    className="cursor-pointer text-sm font-normal"
                  >
                    From Watchlist
                  </Label>
                </div>
              </div>
            </div>

            {searchMethod === 'watchlist' ? (
              // Watchlist Selection
              <div className="space-y-2">
                <Label htmlFor="watchlist_id">Select Watchlist</Label>
                {isLoadingWatchlists ? (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>Loading watchlists...</span>
                  </div>
                ) : (
                  <SearchableSelect
                    options={watchlistOptions}
                    value={watchlistId}
                    onValueChange={(value) => setValue('watchlist_id', value)}
                    placeholder="Select a watchlist..."
                    disabled={watchlistOptions.length === 0}
                  />
                )}
                {watchlistOptions.length === 0 && !isLoadingWatchlists && (
                  <p className="text-sm text-muted-foreground">
                    No watchlists available. Create a watchlist first to use
                    this option.
                  </p>
                )}
              </div>
            ) : (
              // Manual Input (Tabs for Text Input and File Upload)
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Text Input</TabsTrigger>
                  <TabsTrigger value="file">File Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search_terms_text">Search Terms</Label>
                    <Textarea
                      id="search_terms_text"
                      placeholder="Enter search terms (one per line)"
                      rows={6}
                      {...register('search_terms_text')}
                      className={
                        errors.search_terms_text ? 'border-red-500' : ''
                      }
                      disabled={searchTermsFromFile.length > 0}
                    />
                    {errors.search_terms_text && (
                      <p className="text-sm text-red-500">
                        {errors.search_terms_text.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Enter one search term per line. Maximum 1000 terms.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  {uploadedFileName ? (
                    <div className="rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-4 dark:bg-green-950">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-6 w-6 text-green-600" />
                          <div>
                            <p className="font-medium">{uploadedFileName}</p>
                            <p className="text-sm text-muted-foreground">
                              {searchTermsFromFile.length} search terms loaded
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearFileData}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      {...getRootProps()}
                      className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                        isDragActive
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-300 hover:border-primary hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      {isDragActive ? (
                        <p className="text-lg font-medium">
                          Drop the file here...
                        </p>
                      ) : (
                        <div>
                          <p className="mb-2 text-lg font-medium">
                            Drag & drop a file here, or click to select
                          </p>
                          <p className="text-sm text-gray-500">
                            Supports TXT or CSV files with one search term per
                            line
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}

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
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit_per_term">Results per Term</Label>
                <Input
                  id="limit_per_term"
                  type="number"
                  min="1"
                  max="100"
                  {...register('limit_per_term', { valueAsNumber: true })}
                />
              </div>
            </div>

            {searchMutation.isPending || watchlistMatchMutation.isPending ? (
              <LoadingButton isLoading={true} className="w-full">
                Searching...
              </LoadingButton>
            ) : (
              <Button type="submit" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                {searchMethod === 'watchlist'
                  ? 'Search from Watchlist'
                  : 'Bulk Search'}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bulk Search Results</CardTitle>
                <CardDescription>
                  Processed {results.length} search terms in{' '}
                  {searchTime.toFixed(2)}ms
                </CardDescription>
              </div>
              <Button onClick={exportResults} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 space-y-4 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-medium">"{result.search_term}"</h4>
                    <Badge variant="outline">
                      {result.total_matches} matches
                    </Badge>
                  </div>

                  {result.results.length > 0 ? (
                    <div className="space-y-2">
                      {result.results.map((match, matchIndex) => (
                        <div
                          key={matchIndex}
                          className="flex items-center justify-between rounded bg-muted p-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {match.value}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Row {match.row_index}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="w-16">
                                <Progress
                                  value={match.score * 100}
                                  className="h-2"
                                />
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {(match.score * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No matches found
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
