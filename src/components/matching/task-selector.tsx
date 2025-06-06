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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { FileText, CheckCircle } from 'lucide-react'
import { tasksApi, matchingApi } from '@/lib/api'
import { Task, ColumnInfo } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

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
  const [columns, setColumns] = useState<ColumnInfo[]>([])

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
                    <SelectItem key={column.name} value={column.name}>
                      <div className="flex w-full items-center justify-between">
                        <div>
                          <span className="font-medium">{column.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({column.type})
                          </span>
                        </div>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {column.unique_count} unique
                        </span>
                      </div>
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
            {(() => {
              const column = columns.find((c) => c.name === selectedColumnName)
              if (!column) return null

              return (
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <strong>Name:</strong> {column.name}
                  </p>
                  <p>
                    <strong>Type:</strong> {column.type}
                  </p>
                  <p>
                    <strong>Unique Values:</strong>{' '}
                    {column.unique_count.toLocaleString()}
                  </p>
                  <p>
                    <strong>Null Values:</strong>{' '}
                    {column.null_count.toLocaleString()}
                  </p>
                  {column.sample_values.length > 0 && (
                    <div>
                      <strong>Sample Values:</strong>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {column.sample_values
                          .slice(0, 5)
                          .map((value, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {value}
                            </Badge>
                          ))}
                        {column.sample_values.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{column.sample_values.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
