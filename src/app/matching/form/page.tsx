'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { ArrowLeft, Search } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { matchingApi, watchlistsApi } from '@/lib/api'
import {
  SearchRequest,
  SingleSearchRequest,
  BulkSearchRequest,
  AsyncSearchResponse,
  AsyncBulkSearchResponse,
} from '@/types/matching'
import { toast } from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MultiSelect, Option } from '@/components/ui/multi-select'
import { SearchableSelect } from '@/components/ui/searchable-select'

const getDefultActiveTab = (type: string) => {
  if (['single', 'bulk'].includes(type)) {
    return type
  } else {
    return 'single'
  }
}

const searchForm = z.object({
  task_id: z.string().min(1, 'Task ID is required'),
  name: z.string().min(1, 'Search term is required'),
  threshold: z
    .number()
    .min(0, 'Threshold must be between 0 - 1')
    .max(1, 'Threshold must be between 0 - 1'),
  columns: z
    .array(z.string())
    .min(1, 'Must select search target columns atleast 1'),
})

const bulkForm = z
  .object({
    task_id: z.string().min(1, 'Task ID is required'),
    list: z.string().optional(),
    threshold: z
      .number()
      .min(0, 'Threshold must be between 0 - 1')
      .max(1, 'Threshold must be between 0 - 1'),
    columns: z
      .array(z.string())
      .min(1, 'Must select search target columns atleast 1'),
    search_method: z.enum(['manual', 'watchlist']),
    watchlist_id: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.search_method === 'manual') {
        return data.list && data.list.trim().length > 0
      }
      if (data.search_method === 'watchlist') {
        return data.watchlist_id && data.watchlist_id.length > 0
      }
      return false
    },
    {
      message: 'Please provide search terms or select a watchlist',
      path: ['list'],
    }
  )

type SearchForm = z.infer<typeof searchForm>
type BulkForm = z.infer<typeof bulkForm>

export default function MatchingFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const task_id = searchParams.get('task_id') || ''
  const type = getDefultActiveTab(searchParams.get('type') || '')
  const [activeTab, setActiveTab] = useState(type)

  // #region Fetch watchlists
  const { data: watchlistsData, isLoading: isLoadingWatchlists } = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => watchlistsApi.list().then((res) => res?.data),
  })
  // #endregion

  // #region form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SearchForm>({
    resolver: zodResolver(searchForm),
    defaultValues: {
      task_id: '',
      name: '',
      threshold: 0.95,
      columns: [],
    },
  })

  const blukFormHook = useForm<BulkForm>({
    resolver: zodResolver(bulkForm),
    defaultValues: {
      task_id: '',
      list: '',
      threshold: 0.95,
      columns: [],
      search_method: 'manual',
      watchlist_id: '',
    },
  })
  // #endregion

  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [columnOptions, setColumnOptions] = useState<Option[]>([])
  const [loadingColumns, setLoadingColumns] = useState(false)

  // #region Transform watchlists into options for the select
  const watchlistOptions =
    watchlistsData?.list.map((watchlist) => ({
      label: `${watchlist.title} (${watchlist.total_names} terms)`,
      value: watchlist._id,
    })) || []
  // #endregion

  // #region Watch task_id from form
  const currentTaskId = watch('task_id')
  useEffect(() => {
    if (currentTaskId) fetchColumns(currentTaskId)
  }, [currentTaskId])
  const list = blukFormHook.watch('list')
  const listNumber = list?.split('\n')?.length || 0
  // #endregion

  // #region Fetch existing watchlist data
  const watchlistId = blukFormHook.watch('watchlist_id') || ''
  const { isLoading: isLoadingWatchlist } = useQuery({
    queryKey: ['watchlist', watchlistId],
    queryFn: () =>
      watchlistsApi.get(watchlistId).then((res) => {
        const list = (res.data.list || []).filter((item) => item).join('\n')
        blukFormHook.setValue('list', list)
        return res.data
      }),
    enabled: !!watchlistId,
  })
  // #endregion

  // #region Function to fetch columns from API
  const fetchColumns = async (taskId: string) => {
    setLoadingColumns(true)
    try {
      const data = await matchingApi.getColumns(taskId).then((res) => res.data)
      const newColumnOptions: Option[] = [
        ...data.columns.map((key: any) => ({
          label: key,
          value: key,
        })),
      ]
      setColumnOptions(newColumnOptions)
      toast.success(`Loaded ${data.columns.length} columns`)
    } catch (error: any) {
      console.error('Error fetching columns:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch columns')
    } finally {
      setLoadingColumns(false)
    }
  }
  // #endregion

  useEffect(() => {
    setValue('task_id', task_id || '')
    blukFormHook.setValue('task_id', task_id || '')
  }, [task_id, setValue, blukFormHook])

  useEffect(() => {
    setValue('columns', selectedColumns)
  }, [selectedColumns, setValue])

  // #region Handle clearing form fields when search method changes
  const searchMethod = blukFormHook.watch('search_method')
  const [previousSearchMethod, setPreviousSearchMethod] = useState<
    'manual' | 'watchlist'
  >('manual')
  useEffect(() => {
    if (searchMethod !== previousSearchMethod) {
      if (previousSearchMethod === 'manual' && searchMethod === 'watchlist') {
        // manual input → form watchlist: clear selected watchlist and clear search terms
        blukFormHook.setValue('watchlist_id', '')
        blukFormHook.setValue('list', '')
      } else if (
        previousSearchMethod === 'watchlist' &&
        searchMethod === 'manual'
      ) {
        // form watchlist → manual input: clear only selected watchlist
        blukFormHook.setValue('watchlist_id', '')
      }
      setPreviousSearchMethod(searchMethod)
    }
  }, [searchMethod, previousSearchMethod, blukFormHook])
  // #endregion

  // #region Mutation
  // Single Search Mutation
  const singleSearchMutation = useMutation({
    mutationFn: (data: SearchRequest) => {
      // Transform SearchRequest to SingleSearchRequest for API
      const singleSearchData: SingleSearchRequest = {
        task_id: data.task_id,
        columns: data.columns,
        name: data.name,
        threshold: data.threshold,
      }
      return matchingApi.search(singleSearchData)
    },
    onSuccess: (response) => {
      const { search_id, status } = response.data
      if (search_id) {
        toast.success(
          `Search submitted successfully! Redirecting to results...`
        )
        // Immediately redirect to results page with search_id for status polling
        router.push(`/matching?search_id=${search_id}`)
      } else {
        toast.error('No search ID returned from server')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Search failed')
    },
  })

  const handleSingleSubmit = (ssData: SearchForm) => {
    if (
      !ssData.task_id ||
      !ssData.columns.length ||
      !ssData.name ||
      !ssData.threshold
    ) {
      toast.error('Please fill in all required fields')
      return
    }

    // Convert columns array to single column (take first selected or join them)
    const column = ssData.columns.includes('all')
      ? columnOptions.map((item) => item.value)
      : ssData.columns

    singleSearchMutation.mutate({
      task_id: ssData.task_id,
      columns: column,
      name: ssData.name,
      threshold: ssData.threshold * 100,
    })
  }

  // Bulk Search Mutation
  const bulkSearchMutation = useMutation({
    mutationFn: (data: BulkSearchRequest) => matchingApi.bulkSearch(data),
    onSuccess: (response) => {
      const { search_id, status } = response.data
      if (search_id) {
        toast.success(
          `Bulk search submitted successfully! Redirecting to results...`
        )
        // Immediately redirect to results page with search_id for status polling
        router.push(`/matching?search_id=${search_id}`)
      } else {
        toast.error('No search ID returned from server')
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Bulk search failed')
    },
  })

  const handleBulkSubmit = (bsData: BulkForm) => {
    if (!bsData.task_id || !bsData.columns.length) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!bsData.list || !bsData.list.trim()) {
      toast.error('Please enter search terms')
      return
    }

    // Convert textarea content to array
    const searchTerms = bsData.list
      .split('\n')
      .map((term) => term.trim())
      .filter((term) => term.length > 0)

    if (searchTerms.length === 0) {
      toast.error('Please enter at least one search term')
      return
    }

    // Convert to API format
    const column = bsData.columns.includes('all')
      ? columnOptions
          .filter((opt) => opt.value !== 'all')
          .map((opt) => opt.value)
      : bsData.columns

    bulkSearchMutation.mutate({
      task_id: bsData.task_id,
      columns: column,
      list: searchTerms,
      threshold: bsData.threshold * 100,
      watchlist_id: bsData.watchlist_id,
    })
  }
  // #endregion

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Matching Search
            </h1>
            <p className="text-muted-foreground">
              Search for similar values in your processed data
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Search</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Search</TabsTrigger>
            </TabsList>

            {/* Single */}
            <TabsContent value="single" className="space-y-6">
              <form
                onSubmit={handleSubmit(handleSingleSubmit)}
                className="space-y-6"
              >
                {/* task_id & columns */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="single-task">Task ID *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="task_id"
                        disabled
                        placeholder="Enter task ID (24 character UUID)"
                        {...register('task_id')}
                        className={errors.task_id ? 'border-red-500' : ''}
                      />
                    </div>
                    {errors.task_id && (
                      <p className="text-sm text-red-500">
                        {errors.task_id.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="single-column">Columns *</Label>
                    <MultiSelect
                      options={columnOptions}
                      selected={selectedColumns}
                      onChange={(values) => {
                        setSelectedColumns(values)
                        setValue('columns', values)
                      }}
                      placeholder="Select columns to search..."
                    />
                    {errors.columns && (
                      <p className="text-sm text-red-500">
                        {errors.columns.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Search Term *</Label>
                  <Input
                    id="name"
                    placeholder="Enter search term..."
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="">
                  <Label>Threshold: {watch('threshold')}</Label>
                  <Slider
                    value={[watch('threshold')]}
                    onValueChange={([value]) => setValue('threshold', value)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Higher values = more exact matches
                  </p>
                  {errors.threshold && (
                    <p className="text-sm text-red-500">
                      {errors.threshold.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={singleSearchMutation.isPending}
                  className="w-full"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {singleSearchMutation.isPending
                    ? 'Searching...'
                    : 'Start Single Search'}
                </Button>
              </form>
            </TabsContent>

            {/* Multiple */}
            <TabsContent value="bulk" className="space-y-6">
              <form
                onSubmit={(e) => {
                  blukFormHook.handleSubmit(handleBulkSubmit)(e)
                }}
                className="space-y-6"
              >
                {/* task_id & columns */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="single-task">Task ID *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="task_id"
                        disabled
                        placeholder="Enter task ID (24 character UUID)"
                        {...blukFormHook.register('task_id')}
                        className={
                          blukFormHook.formState.errors.task_id
                            ? 'border-red-500'
                            : ''
                        }
                      />
                    </div>
                    {blukFormHook.formState.errors.task_id && (
                      <p className="text-sm text-red-500">
                        {blukFormHook.formState.errors.task_id.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-columns">Columns *</Label>
                    <MultiSelect
                      options={columnOptions}
                      selected={blukFormHook.watch('columns')}
                      onChange={(values) => {
                        blukFormHook.setValue('columns', values)
                      }}
                      loading={loadingColumns}
                      placeholder="Select columns to search..."
                      maxSelections={3}
                    />
                    {blukFormHook.formState.errors.columns && (
                      <p className="text-sm text-red-500">
                        {blukFormHook.formState.errors.columns.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Search Method & Watchlist Selection */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Search Terms Source *
                    </Label>
                    <div className="flex flex-col space-y-2 pt-1.5 sm:flex-row sm:space-x-12 sm:space-y-1 lg:space-x-32">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="manual"
                          value="manual"
                          {...blukFormHook.register('search_method')}
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
                          {...blukFormHook.register('search_method')}
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
                        value={blukFormHook.watch('watchlist_id')}
                        onValueChange={(value) =>
                          blukFormHook.setValue('watchlist_id', value)
                        }
                        placeholder="Select a watchlist..."
                        disabled={
                          watchlistOptions.length === 0 ||
                          blukFormHook.watch('search_method') === 'manual'
                        }
                      />
                    )}
                    {watchlistOptions.length === 0 && !isLoadingWatchlists && (
                      <p className="text-sm text-muted-foreground">
                        No watchlists available. Create a watchlist first to use
                        this option.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="list">Search Terms *</Label>
                  <Textarea
                    id="list"
                    placeholder={
                      isLoadingWatchlist
                        ? 'Loading watchlist'
                        : 'Enter search terms (one per line)...'
                    }
                    rows={Math.max(6, Math.min(20, listNumber))}
                    {...blukFormHook.register('list')}
                    className={
                      blukFormHook.formState.errors.list ? 'border-red-500' : ''
                    }
                    disabled={
                      blukFormHook.watch('search_method') === 'watchlist'
                    }
                  />
                  {blukFormHook.formState.errors.list && (
                    <p className="text-sm text-red-500">
                      {blukFormHook.formState.errors.list.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Enter one search term per line
                  </p>
                </div>

                <div className="">
                  <Label>Threshold: {blukFormHook.watch('threshold')}</Label>
                  <Slider
                    value={[blukFormHook.watch('threshold')]}
                    onValueChange={([value]) =>
                      blukFormHook.setValue('threshold', value)
                    }
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Higher values = more exact matches
                  </p>
                  {blukFormHook.formState.errors.threshold && (
                    <p className="text-sm text-red-500">
                      {blukFormHook.formState.errors.threshold.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={bulkSearchMutation.isPending}
                  className="w-full"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {bulkSearchMutation.isPending
                    ? 'Searching...'
                    : blukFormHook.watch('search_method') === 'watchlist'
                      ? 'Search from Watchlist'
                      : `Start Bulk Search (${listNumber} terms)`}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
