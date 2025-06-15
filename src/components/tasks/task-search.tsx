import { Task } from '@/types'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { CreateSearchRequest } from '@/types/search'
import { searchApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface TaskSearchProps {
  task: Task
  onSuccess?: () => void
}

interface SearchRow {
  no: number
  [key: string]: string | number
}

interface ColumnOptions {
  whole_word: boolean
  match_case: boolean
  match_length: boolean
}

export default function TaskSearch({ task, onSuccess }: TaskSearchProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [searchRows, setSearchRows] = useState<SearchRow[]>([])
  const [columnOptions, setColumnOptions] = useState<
    Record<string, ColumnOptions>
  >({})

  useEffect(() => {
    if (selectedColumns.length > 0) {
      setSearchRows([
        {
          no: 1,
          ...Object.fromEntries(selectedColumns.map((col) => [col, ''])),
        },
      ])

      // Initialize column options for new columns
      const newOptions = { ...columnOptions }
      selectedColumns.forEach((col) => {
        if (!newOptions[col]) {
          newOptions[col] = {
            whole_word: true,
            match_case: false,
            match_length: true,
          }
        }
      })

      // Remove options for unselected columns
      Object.keys(newOptions).forEach((col) => {
        if (!selectedColumns.includes(col)) {
          delete newOptions[col]
        }
      })

      setColumnOptions(newOptions)
    } else {
      setSearchRows([])
      setColumnOptions({})
    }
  }, [selectedColumns])

  const handleColumnSelect = (column: string, checked: boolean) => {
    if (checked && selectedColumns.length < 4) {
      setSelectedColumns([...selectedColumns, column])
    } else if (!checked) {
      setSelectedColumns(selectedColumns.filter((col) => col !== column))
    }
  }

  const addRow = () => {
    const newRow: SearchRow = {
      no: searchRows.length + 1,
      ...Object.fromEntries(selectedColumns.map((col) => [col, ''])),
    }
    setSearchRows([...searchRows, newRow])
  }

  const removeRow = (index: number) => {
    const updatedRows = searchRows.filter((_, i) => i !== index)
    const reNumberedRows = updatedRows.map((row, i) => ({ ...row, no: i + 1 }))
    setSearchRows(reNumberedRows)
  }

  const updateRowValue = (rowIndex: number, column: string, value: string) => {
    const updatedRows = searchRows.map((row, index) =>
      index === rowIndex ? { ...row, [column]: value } : row
    )
    setSearchRows(updatedRows)
  }

  const updateColumnOption = (
    column: string,
    option: keyof ColumnOptions,
    value: boolean
  ) => {
    setColumnOptions((prev) => ({
      ...prev,
      [column]: {
        ...prev[column],
        [option]: value,
      },
    }))
  }

  const handleKeyDown = (
    e: React.KeyboardEvent,
    rowIndex: number,
    columnIndex: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      // If it's the last column in the row, add a new row
      if (columnIndex === selectedColumns.length - 1) {
        addRow()
        // Focus on the first input of the new row after a brief delay
        setTimeout(() => {
          const newRowFirstInput = document.querySelector(
            `input[data-row="${rowIndex + 1}"][data-column="0"]`
          ) as HTMLInputElement
          if (newRowFirstInput) {
            newRowFirstInput.focus()
          }
        }, 50)
      } else {
        // Focus on the next input in the same row
        const nextInput = document.querySelector(
          `input[data-row="${rowIndex}"][data-column="${columnIndex + 1}"]`
        ) as HTMLInputElement
        if (nextInput) {
          nextInput.focus()
        }
      }
    }
  }

  const createMuation = useMutation({
    mutationFn: (data: CreateSearchRequest) => searchApi.create(data),
    onSuccess: () => {
      toast.success('Search background process created successfully!')
      onSuccess && onSuccess()
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          'Failed to create search background process'
      )
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      task_id: task._id,
      column_names: selectedColumns,
      column_options: columnOptions,
      list: searchRows,
    }

    console.log('Search Form Submission:', JSON.stringify(submitData, null, 2))
    createMuation.mutate(submitData)
  }

  const isCreating = createMuation.isPending

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Searching Form
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Column Selection */}
          <div className="space-y-3">
            <Label>Select Columns (Max 4) *</Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {task.column_names?.map((column) => (
                <div key={column} className="flex items-center space-x-2">
                  <Checkbox
                    id={column}
                    checked={selectedColumns.includes(column)}
                    onCheckedChange={(checked) =>
                      handleColumnSelect(column, checked as boolean)
                    }
                    disabled={
                      !selectedColumns.includes(column) &&
                      selectedColumns.length >= 4
                    }
                  />
                  <Label
                    htmlFor={column}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {column}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {selectedColumns.length}/4 columns
            </p>
          </div>

          {/* Search Options for Each Column */}
          {selectedColumns.length > 0 && (
            <div className="space-y-4">
              <Label>Search Options</Label>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div>• Whole word: Match complete words only</div>
                <div>• Match case: Case-sensitive matching</div>
                <div>• Match length: Exact length matching</div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {selectedColumns.map((column) => (
                  <div key={column} className="rounded-lg border p-4">
                    <div className="mb-3 text-sm font-medium">{column}</div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${column}-whole-word`}
                          checked={columnOptions[column]?.whole_word ?? true}
                          onCheckedChange={(checked) =>
                            updateColumnOption(
                              column,
                              'whole_word',
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          htmlFor={`${column}-whole-word`}
                          className="text-sm font-normal"
                        >
                          Whole word
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${column}-match-case`}
                          checked={columnOptions[column]?.match_case ?? false}
                          onCheckedChange={(checked) =>
                            updateColumnOption(
                              column,
                              'match_case',
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          htmlFor={`${column}-match-case`}
                          className="text-sm font-normal"
                        >
                          Match case
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${column}-match-length`}
                          checked={columnOptions[column]?.match_length ?? true}
                          onCheckedChange={(checked) =>
                            updateColumnOption(
                              column,
                              'match_length',
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          htmlFor={`${column}-match-length`}
                          className="text-sm font-normal"
                        >
                          Match length
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Table */}
          {selectedColumns.length > 0 && (
            <div className="space-y-4">
              <Label>Search Data</Label>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div>• Press enter for next input</div>
              </div>
              <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left font-medium">No</th>
                        {selectedColumns.map((column) => (
                          <th
                            key={column}
                            className="p-3 text-left font-medium"
                          >
                            {column}
                          </th>
                        ))}
                        <th className="p-3 text-center font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchRows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t">
                          <td className="p-3 font-medium">{row.no}</td>
                          {selectedColumns.map((column, columnIndex) => (
                            <td key={column} className="p-3">
                              <Input
                                value={(row[column] || '') as string}
                                onChange={(e) =>
                                  updateRowValue(
                                    rowIndex,
                                    column,
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) =>
                                  handleKeyDown(e, rowIndex, columnIndex)
                                }
                                placeholder={`Enter ${column}`}
                                className="min-w-[120px]"
                                data-row={rowIndex}
                                data-column={columnIndex}
                              />
                            </td>
                          ))}
                          <td className="p-3 text-center">
                            {searchRows.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRow(rowIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addRow}
                className="flex w-full items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Row
              </Button>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={selectedColumns.length === 0 || searchRows.length === 0}
              className="w-full md:w-auto"
            >
              {isCreating ? 'Creating Search' : 'Search Data'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
