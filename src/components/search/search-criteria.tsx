'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'

interface SearchCriteriaProps {
  columnNames: string[]
  columnOptions: {
    [key: string]: {
      whole_word: boolean
      match_case: boolean
      match_length: boolean
    }
  }
}

export default function SearchCriteria({
  columnNames,
  columnOptions,
}: SearchCriteriaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Options for Each Column</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {columnNames.map((columnName) => {
            const options = columnOptions[columnName]
            if (!options) return null

            return (
              <div key={columnName} className="h-25 rounded-lg border p-4">
                <h4 className="mb-3 text-sm font-medium">{columnName}</h4>
                <div className="flex flex-col gap-2">
                  <Badge
                    variant={options.whole_word ? 'default' : 'secondary'}
                    className="justify-start text-xs"
                  >
                    {options.whole_word ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    Whole Word
                  </Badge>
                  <Badge
                    variant={options.match_case ? 'default' : 'secondary'}
                    className="justify-start text-xs"
                  >
                    {options.match_case ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    Match Case
                  </Badge>
                  <Badge
                    variant={options.match_length ? 'default' : 'secondary'}
                    className="justify-start text-xs"
                  >
                    {options.match_length ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    Match Length
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
