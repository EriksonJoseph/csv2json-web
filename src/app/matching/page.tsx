'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { TaskSelector } from '@/components/matching/task-selector'
import { SingleSearch } from '@/components/matching/single-search'
import { BulkSearch } from '@/components/matching/bulk-search'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, List } from 'lucide-react'

export default function MatchingPage() {
  const searchParams = useSearchParams()
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [selectedColumnName, setSelectedColumnName] = useState<string>('')
  const [activeTab, setActiveTab] = useState('single')

  useEffect(() => {
    const taskParam = searchParams.get('task')
    if (taskParam) {
      setSelectedTaskId(taskParam)
    }
  }, [searchParams])

  const canSearch = selectedTaskId && selectedColumnName

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuzzy Matching</h1>
          <p className="text-muted-foreground">
            Search for similar values in your processed data
          </p>
        </div>
      </div>

      <TaskSelector
        selectedTaskId={selectedTaskId}
        selectedColumnName={selectedColumnName}
        onTaskSelect={setSelectedTaskId}
        onColumnSelect={setSelectedColumnName}
      />

      {canSearch && (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="single" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Single Search</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>Bulk Search</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <SingleSearch
              taskId={selectedTaskId}
              columnName={selectedColumnName}
            />
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <BulkSearch
              taskId={selectedTaskId}
              columnName={selectedColumnName}
            />
          </TabsContent>
        </Tabs>
      )}

      {!canSearch && selectedTaskId && (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            Select a Column
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a column from the selected task to start searching
          </p>
        </div>
      )}

      {!selectedTaskId && (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            Select a Task
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a completed task to start fuzzy matching
          </p>
        </div>
      )}
    </div>
  )
}
