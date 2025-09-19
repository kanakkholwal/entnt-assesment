import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter, X } from 'lucide-react'
import type { JobFilters as JobFiltersType } from '@/types/job'

interface JobFiltersProps {
  filters: JobFiltersType
  onFiltersChange: (filters: Partial<JobFiltersType>) => void
  availableTags?: string[]
}

const statusOptions = [
  { value: 'all', label: 'All Jobs' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
] as const

export function JobFilters({ filters, onFiltersChange, availableTags = [] }: JobFiltersProps) {
  const activeFiltersCount = [
    filters.status && filters.status !== 'all' ? 1 : 0,
    filters.tags?.length || 0,
  ].reduce((sum, count) => sum + count, 0)

  const clearAllFilters = () => {
    onFiltersChange({
      status: 'all',
      tags: [],
    })
  }

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    onFiltersChange({ tags: newTags })
  }

  const removeTag = (tag: string) => {
    const newTags = (filters.tags || []).filter(t => t !== tag)
    onFiltersChange({ tags: newTags })
  }

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {statusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.status === option.value || (!filters.status && option.value === 'all')}
              onCheckedChange={() => onFiltersChange({ status: option.value })}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          
          {availableTags.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Tags</DropdownMenuLabel>
              {availableTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={filters.tags?.includes(tag) || false}
                  onCheckedChange={() => toggleTag(tag)}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="capitalize">
              {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-2 hover:bg-transparent"
                onClick={() => onFiltersChange({ status: 'all' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-2 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}