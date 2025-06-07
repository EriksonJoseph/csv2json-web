'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Upload, Plus, X } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { matchingApi, tasksApi } from '@/lib/api'
import { SearchRequest, BulkSearchRequest } from '@/types/matching'
import { toast } from 'react-hot-toast'

export default function MatchingFormPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('single')
  
  // Single Search Form State
  const [singleForm, setSingleForm] = useState({
    task_id: '',
    column_name: '',
    search_term: '',
    threshold: 0.8,
    limit: 10
  })

  // Bulk Search Form State
  const [bulkForm, setBulkForm] = useState({
    task_id: '',
    column_name: '',
    search_terms: [] as string[],
    threshold: 0.8,
    limit_per_term: 10
  })

  const [bulkSearchInput, setBulkSearchInput] = useState('')

  // Get available tasks
  const { data: tasksData } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list({ page: 1, limit: 100 }).then(res => res.data)
  })

  // Get columns for selected task
  const { data: columnsData } = useQuery({
    queryKey: ['task-columns', singleForm.task_id || bulkForm.task_id],
    queryFn: () => matchingApi.getColumns(singleForm.task_id || bulkForm.task_id),
    enabled: !!(singleForm.task_id || bulkForm.task_id)
  })

  // Single Search Mutation
  const singleSearchMutation = useMutation({
    mutationFn: (data: SearchRequest) => matchingApi.search(data),
    onSuccess: (response) => {
      toast.success(`Found ${response.data.total_matches} matches in ${response.data.search_time}ms`)
      router.push('/matching')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Search failed')
    }
  })

  // Bulk Search Mutation
  const bulkSearchMutation = useMutation({
    mutationFn: (data: BulkSearchRequest) => matchingApi.bulkSearch(data),
    onSuccess: (response) => {
      const totalMatches = response.data.results.reduce((sum, result) => sum + result.total_matches, 0)
      toast.success(`Found ${totalMatches} total matches in ${response.data.total_search_time}ms`)
      router.push('/matching')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Bulk search failed')
    }
  })

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!singleForm.task_id || !singleForm.column_name || !singleForm.search_term) {
      toast.error('Please fill in all required fields')
      return
    }
    singleSearchMutation.mutate(singleForm)
  }

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkForm.task_id || !bulkForm.column_name || bulkForm.search_terms.length === 0) {
      toast.error('Please fill in all required fields and add at least one search term')
      return
    }
    bulkSearchMutation.mutate(bulkForm)
  }

  const addBulkSearchTerm = () => {
    if (bulkSearchInput.trim() && !bulkForm.search_terms.includes(bulkSearchInput.trim())) {
      setBulkForm(prev => ({
        ...prev,
        search_terms: [...prev.search_terms, bulkSearchInput.trim()]
      }))
      setBulkSearchInput('')
    }
  }

  const removeBulkSearchTerm = (term: string) => {
    setBulkForm(prev => ({
      ...prev,
      search_terms: prev.search_terms.filter(t => t !== term)
    }))
  }

  const addMultipleBulkTerms = () => {
    const terms = bulkSearchInput
      .split('\n')
      .map(term => term.trim())
      .filter(term => term && !bulkForm.search_terms.includes(term))
    
    if (terms.length > 0) {
      setBulkForm(prev => ({
        ...prev,
        search_terms: [...prev.search_terms, ...terms]
      }))
      setBulkSearchInput('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Matching Search</h1>
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

            <TabsContent value="single" className="space-y-6">
              <form onSubmit={handleSingleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="single-task">Task *</Label>
                    <Select
                      value={singleForm.task_id}
                      onValueChange={(value) => setSingleForm(prev => ({ ...prev, task_id: value, column_name: '' }))}
                    >
                      <option value="">Select a task</option>
                      {tasksData?.list?.map((task) => (
                        <option key={task._id} value={task._id}>
                          {task.topic} ({task.is_done_created_doc ? 'completed' : 'processing'})
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="single-column">Column *</Label>
                    <Select
                      value={singleForm.column_name}
                      onValueChange={(value) => setSingleForm(prev => ({ ...prev, column_name: value }))}
                      disabled={!singleForm.task_id}
                    >
                      <option value="">Select a column</option>
                      {columnsData?.data?.columns?.map((column) => (
                        <option key={column.name} value={column.name}>
                          {column.name} ({column.type})
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="single-search-term">Search Term *</Label>
                  <Input
                    id="single-search-term"
                    value={singleForm.search_term}
                    onChange={(e) => setSingleForm(prev => ({ ...prev, search_term: e.target.value }))}
                    placeholder="Enter search term..."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Threshold: {singleForm.threshold}</Label>
                    <Slider
                      value={[singleForm.threshold]}
                      onValueChange={([value]) => setSingleForm(prev => ({ ...prev, threshold: value }))}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Higher values = more exact matches
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="single-limit">Result Limit</Label>
                    <Input
                      id="single-limit"
                      type="number"
                      min="1"
                      max="1000"
                      value={singleForm.limit}
                      onChange={(e) => setSingleForm(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={singleSearchMutation.isPending}
                  className="w-full"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {singleSearchMutation.isPending ? 'Searching...' : 'Start Single Search'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-6">
              <form onSubmit={handleBulkSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-task">Task *</Label>
                    <Select
                      value={bulkForm.task_id}
                      onValueChange={(value) => setBulkForm(prev => ({ ...prev, task_id: value, column_name: '' }))}
                    >
                      <option value="">Select a task</option>
                      {tasksData?.list?.map((task) => (
                        <option key={task._id} value={task._id}>
                          {task.topic} ({task.is_done_created_doc ? 'completed' : 'processing'})
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-column">Column *</Label>
                    <Select
                      value={bulkForm.column_name}
                      onValueChange={(value) => setBulkForm(prev => ({ ...prev, column_name: value }))}
                      disabled={!bulkForm.task_id}
                    >
                      <option value="">Select a column</option>
                      {columnsData?.data?.columns?.map((column) => (
                        <option key={column.name} value={column.name}>
                          {column.name} ({column.type})
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-search-terms">Search Terms *</Label>
                  <div className="space-y-2">
                    <Textarea
                      id="bulk-search-terms"
                      value={bulkSearchInput}
                      onChange={(e) => setBulkSearchInput(e.target.value)}
                      placeholder="Enter search terms (one per line or single term)..."
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addBulkSearchTerm}
                        disabled={!bulkSearchInput.trim()}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Term
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addMultipleBulkTerms}
                        disabled={!bulkSearchInput.includes('\n')}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Add Multiple
                      </Button>
                    </div>
                  </div>

                  {bulkForm.search_terms.length > 0 && (
                    <div className="space-y-2">
                      <Label>Added Terms ({bulkForm.search_terms.length})</Label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {bulkForm.search_terms.map((term, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {term}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeBulkSearchTerm(term)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Threshold: {bulkForm.threshold}</Label>
                    <Slider
                      value={[bulkForm.threshold]}
                      onValueChange={([value]) => setBulkForm(prev => ({ ...prev, threshold: value }))}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Higher values = more exact matches
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-limit">Limit Per Term</Label>
                    <Input
                      id="bulk-limit"
                      type="number"
                      min="1"
                      max="1000"
                      value={bulkForm.limit_per_term}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, limit_per_term: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={bulkSearchMutation.isPending}
                  className="w-full"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {bulkSearchMutation.isPending ? 'Searching...' : `Start Bulk Search (${bulkForm.search_terms.length} terms)`}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}