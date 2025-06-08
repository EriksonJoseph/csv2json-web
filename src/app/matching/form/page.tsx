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
import { ArrowLeft, Search, RefreshCw } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { matchingApi } from '@/lib/api'
import {
  SearchRequest,
  SingleSearchRequest,
  BulkSearchRequest,
} from '@/types/matching'
import { toast } from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MultiSelect, Option } from '@/components/ui/multi-select'

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

const bulkForm = z.object({
  task_id: z.string().min(1, 'Task ID is required'),
  list: z.string().min(1, 'Search term is required'),
  threshold: z
    .number()
    .min(0, 'Threshold must be between 0 - 1')
    .max(1, 'Threshold must be between 0 - 1'),
  columns: z
    .array(z.string())
    .min(1, 'Must select search target columns atleast 1'),
})

type SearchForm = z.infer<typeof searchForm>
type BulkForm = z.infer<typeof bulkForm>

export default function MatchingFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const task_id = searchParams.get('task_id') || ''
  const type = getDefultActiveTab(searchParams.get('type') || '')
  const [activeTab, setActiveTab] = useState(type)

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
    },
  })
  // #endregion

  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [columnOptions, setColumnOptions] = useState<Option[]>([
    { label: 'All Columns', value: 'all' },
  ])
  const [loadingColumns, setLoadingColumns] = useState(false)

  // Watch task_id from form
  const currentTaskId = watch('task_id')
  const list = blukFormHook.watch('list')
  const listNumber = list?.split('\n')?.length || 0

  // Function to check if string is valid UUID (24 characters for MongoDB ObjectId)
  const isValidUUID = (str: string) => {
    return /^[0-9a-fA-F]{24}$/.test(str)
  }

  // Function to fetch columns from API
  const fetchColumns = async (taskId: string) => {
    if (!isValidUUID(taskId)) {
      return
    }

    setLoadingColumns(true)
    try {
      const data = await matchingApi.getColumns(taskId).then((res) => res.data)
      const newColumnOptions: Option[] = [
        { label: 'All Columns', value: 'all' },
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

  useEffect(() => {
    setValue('task_id', task_id || '')
    blukFormHook.setValue('task_id', task_id || '')
  }, [task_id, setValue, blukFormHook])

  useEffect(() => {
    setValue('columns', selectedColumns)
  }, [selectedColumns, setValue])

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
      toast.success(
        `Found ${response.data.total_matches} matches in ${response.data.search_time}ms`
      )
      // Redirect to result page with search_id
      router.push(`/matching/result/${response.data.search_id}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Search failed')
    },
  })

  // Bulk Search Mutation
  const bulkSearchMutation = useMutation({
    mutationFn: (data: BulkSearchRequest) => matchingApi.bulkSearch(data),
    onSuccess: (response) => {
      const totalMatches = response.data.results.reduce(
        (sum, result) => sum + result.total_matches,
        0
      )
      toast.success(
        `Found ${totalMatches} total matches in ${response.data.total_search_time}ms`
      )
      // Redirect to result page with search_id
      router.push(`/matching/result/${response.data.search_id}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Bulk search failed')
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

  const handleBulkSubmit = (bsData: BulkForm) => {
    if (!bsData.task_id || !bsData.columns.length || !bsData.list.trim()) {
      console.log('🚀🙈 TORPONG [page.tsx] validation failed')
      toast.error('Please fill in all required fields')
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
    })
  }

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
                        placeholder="Enter task ID (24 character UUID)"
                        {...register('task_id')}
                        className={errors.task_id ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={!isValidUUID(currentTaskId) || loadingColumns}
                        onClick={() => fetchColumns(currentTaskId)}
                        title="Fetch columns for this task"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${loadingColumns ? 'animate-spin' : ''}`}
                        />
                      </Button>
                    </div>
                    {errors.task_id && (
                      <p className="text-sm text-red-500">
                        {errors.task_id.message}
                      </p>
                    )}
                    {currentTaskId && !isValidUUID(currentTaskId) && (
                      <p className="text-sm text-yellow-600">
                        Task ID must be a valid 24-character UUID
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
                  console.log('🚀🙈 TORPONG [page.tsx] Form submit triggered')
                  console.log(
                    '🚀🙈 TORPONG [page.tsx] Form errors:',
                    blukFormHook.formState.errors
                  )
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
                        placeholder="Enter task ID (24 character UUID)"
                        {...blukFormHook.register('task_id')}
                        className={
                          blukFormHook.formState.errors.task_id
                            ? 'border-red-500'
                            : ''
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={!isValidUUID(currentTaskId) || loadingColumns}
                        onClick={() => fetchColumns(currentTaskId)}
                        title="Fetch columns for this task"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${loadingColumns ? 'animate-spin' : ''}`}
                        />
                      </Button>
                    </div>
                    {blukFormHook.formState.errors.task_id && (
                      <p className="text-sm text-red-500">
                        {blukFormHook.formState.errors.task_id.message}
                      </p>
                    )}
                    {currentTaskId && !isValidUUID(currentTaskId) && (
                      <p className="text-sm text-yellow-600">
                        Task ID must be a valid 24-character UUID
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
                      placeholder="Select columns to search..."
                    />
                    {blukFormHook.formState.errors.columns && (
                      <p className="text-sm text-red-500">
                        {blukFormHook.formState.errors.columns.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* list */}
                <div className="space-y-2">
                  <Label htmlFor="list">Search Terms *</Label>
                  <Textarea
                    id="list"
                    placeholder="Enter search terms (one per line)..."
                    rows={6}
                    {...blukFormHook.register('list')}
                    className={
                      blukFormHook.formState.errors.list ? 'border-red-500' : ''
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
