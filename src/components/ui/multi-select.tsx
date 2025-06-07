'use client'

import * as React from 'react'
import { ChevronDown, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface Option {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  className,
  disabled = false,
}: MultiSelectProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item))
  }

  const handleSelect = (item: string) => {
    if (selected.includes(item)) {
      handleUnselect(item)
    } else {
      onChange([...selected, item])
    }
  }

  const selectedOptions = options.filter((option) =>
    selected.includes(option.value)
  )

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  React.useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
    }
  }, [open])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-between text-left font-normal',
            !selected.length && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1 mr-2">
            {selected.length > 0 ? (
              selectedOptions.length <= 2 ? (
                selectedOptions.map((option) => (
                  <Badge
                    variant="secondary"
                    key={option.value}
                    className="mr-1"
                  >
                    {option.label}
                    <span
                      className="ml-1 hover:bg-muted rounded-full cursor-pointer inline-flex"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnselect(option.value)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))
              ) : (
                <>
                  <Badge variant="secondary" className="mr-1">
                    {selectedOptions[0]?.label}
                  </Badge>
                  <Badge variant="secondary">
                    +{selected.length - 1} more
                  </Badge>
                </>
              )
            ) : (
              placeholder
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-80" onCloseAutoFocus={(e) => e.preventDefault()}>
        <div className="p-2 border-b" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div className="max-h-48 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={(e) => {
                  e.preventDefault()
                  handleSelect(option.value)
                }}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  checked={selected.includes(option.value)}
                  onChange={() => handleSelect(option.value)}
                />
                <span>{option.label}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No options found
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}