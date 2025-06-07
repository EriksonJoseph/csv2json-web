'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  showItemsPerPageSelector?: boolean
  itemsPerPageOptions?: number[]
  className?: string
  showInfo?: boolean
  maxVisiblePages?: number
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      currentPage,
      totalItems,
      itemsPerPage,
      onPageChange,
      onItemsPerPageChange,
      showItemsPerPageSelector = true,
      itemsPerPageOptions = [6, 9, 12, 15, 24],
      className,
      showInfo = true,
      maxVisiblePages = 5,
      ...props
    },
    ref
  ) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)
    const totalPages = Math.ceil(totalItems / (currentPage || 1))

    const getVisiblePages = () => {
      const pages: (number | 'ellipsis')[] = []

      if (totalPages <= maxVisiblePages) {
        // Show all pages if total pages is less than or equal to max visible pages
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Always show first page
        pages.push(1)

        const startPage = Math.max(
          2,
          currentPage - Math.floor(maxVisiblePages / 2)
        )
        const endPage = Math.min(
          totalPages - 1,
          startPage + maxVisiblePages - 3
        )

        // Add ellipsis if there's a gap after first page
        if (startPage > 2) {
          pages.push('ellipsis')
        }

        // Add visible pages
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }

        // Add ellipsis if there's a gap before last page
        if (endPage < totalPages - 1) {
          pages.push('ellipsis')
        }

        // Always show last page if it's not already included
        if (totalPages > 1) {
          pages.push(totalPages)
        }
      }

      return pages
    }

    const disableNext = (): boolean => {
      return (currentPage || 0) * (itemsPerPage || 0) >= totalItems
    }

    const visiblePages = getVisiblePages()

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between', className)}
        {...props}
      >
        {showInfo && (
          <p className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalItems} items
          </p>
        )}

        {showItemsPerPageSelector && onItemsPerPageChange && (
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange(Number(value))}
          >
            <SelectTrigger className="w-32">
              <Settings className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}/page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="h-9 w-9 items-center rounded-sm bg-blue-400 pt-1 text-center">
            <span className="text-sm">{currentPage}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={disableNext()}
            className="flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }
)

Pagination.displayName = 'Pagination'

export { Pagination }
