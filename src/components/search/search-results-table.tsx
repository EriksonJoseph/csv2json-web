'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, CheckCircle2, Filter, X } from 'lucide-react'

interface SearchResult {
  query_no: number
  query_name: string
  column_results: {
    [key: string]: {
      found: boolean
      count: number
      search_term: string
    }
  }
}

interface SearchResultsTableProps {
  results: SearchResult[]
  columnNames: string[]
  totalSearched: number
  resultsFound: number
}

export default function SearchResultsTable({
  results,
  columnNames,
  totalSearched,
  resultsFound,
}: SearchResultsTableProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Filter results based on active filter
  const filteredResults = useMemo(() => {
    if (!activeFilter) return results

    return results.filter((result) => {
      if (activeFilter === 'no-matches') {
        // Show only queries with no matches in any column
        return !columnNames.some(columnName => 
          result.column_results[columnName]?.found
        )
      } else if (activeFilter === 'all-matches') {
        // Show only queries that match in every column
        return columnNames.every(columnName => 
          result.column_results[columnName]?.found
        )
      } else {
        // Show only queries that have matches in the specific column
        return result.column_results[activeFilter]?.found
      }
    })
  }, [results, activeFilter, columnNames])

  const handleFilterClick = (filterType: string) => {
    setActiveFilter(activeFilter === filterType ? null : filterType)
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Search Results</span>
          <span className="text-sm font-normal text-muted-foreground">
            {activeFilter ? `${filteredResults.length} of ${results.length} queries` : `${resultsFound} of ${totalSearched} queries found matches`}
          </span>
        </CardTitle>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="flex items-center gap-2 mr-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by:</span>
          </div>
          
          <Button
            variant={activeFilter === 'no-matches' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterClick('no-matches')}
            className="h-7"
          >
            <XCircle className="w-3 h-3 mr-1" />
            No Matches
            {activeFilter === 'no-matches' && <X className="w-3 h-3 ml-1" />}
          </Button>

          <Button
            variant={activeFilter === 'all-matches' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterClick('all-matches')}
            className="h-7"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            All Matches
            {activeFilter === 'all-matches' && <X className="w-3 h-3 ml-1" />}
          </Button>

          {columnNames.map((columnName) => (
            <Button
              key={columnName}
              variant={activeFilter === columnName ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterClick(columnName)}
              className="h-7"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              {columnName}
              {activeFilter === columnName && <X className="w-3 h-3 ml-1" />}
            </Button>
          ))}
          
          {activeFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFilter(null)}
              className="h-7 text-muted-foreground"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead className="min-w-[200px]">Query Name</TableHead>
                {columnNames.map((columnName) => (
                  <TableHead key={columnName} className="text-center">
                    {columnName}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columnNames.length + 2} className="text-center py-8 text-muted-foreground">
                    No results match the current filter
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((result) => (
                  <TableRow key={result.query_no}>
                    <TableCell className="font-medium">{result.query_no}</TableCell>
                    <TableCell className="font-medium">{result.query_name}</TableCell>
                    {columnNames.map((columnName) => {
                      const columnResult = result.column_results[columnName]
                      if (!columnResult) {
                        return <TableCell key={columnName} className="text-center">-</TableCell>
                      }

                      return (
                        <TableCell key={columnName} className="text-center">
                          <div className="flex items-center justify-center">
                            {columnResult.found ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                <span className="font-medium">({columnResult.count})</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-500">
                                <XCircle className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}