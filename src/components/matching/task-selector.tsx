'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { matchingApi } from '@/lib/api'

interface TaskSelectorProps {
  selectedTaskId?: string
  selectedColumnName?: string
  onTaskSelect: (taskId: string) => void
  onColumnSelect: (columnName: string) => void
}

export function TaskSelector({
  selectedTaskId,
  selectedColumnName,
  onTaskSelect,
  onColumnSelect,
}: TaskSelectorProps) {
  const [columns, setColumns] = useState<string[]>([])

  const { data: columnsData, isLoading: isLoadingColumns } = useQuery({
    queryKey: ['task-columns', selectedTaskId],
    queryFn: () =>
      matchingApi.getColumns(selectedTaskId!).then((res) => res.data),
    enabled: !!selectedTaskId,
  })

  useEffect(() => {
    if (columnsData) {
      setColumns(columnsData.columns)
    }
  }, [columnsData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Task & Column</CardTitle>
        <CardDescription>
          Choose a completed task and column for fuzzy matching
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Task</Label>
          <Select value={selectedTaskId || ''} onValueChange={onTaskSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a completed task" />
            </SelectTrigger>
            <SelectContent></SelectContent>
          </Select>
        </div>

        {selectedTaskId && (
          <div className="space-y-2">
            <Label>Column</Label>
            {isLoadingColumns ? (
              <div className="flex items-center space-x-2">
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              </div>
            ) : (
              <Select
                value={selectedColumnName || ''}
                onValueChange={onColumnSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a column to search" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {selectedColumnName && columns.length > 0 && (
          <div className="rounded-lg bg-muted p-3">
            <h4 className="mb-2 font-medium">Selected Column</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <strong>Name:</strong> {selectedColumnName}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
