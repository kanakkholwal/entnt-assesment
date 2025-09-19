import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { CandidateFilters, CandidateStage } from '@/types/candidate'

interface CandidateFiltersProps {
  filters: CandidateFilters
  onFiltersChange: (filters: Partial<CandidateFilters>) => void
  className?: string
}

const stageOptions: { value: CandidateStage | 'all'; label: string }[] = [
  { value: 'all', label: 'All Stages' },
  { value: 'applied', label: 'Applied' },
  { value: 'screen', label: 'Screening' },
  { value: 'tech', label: 'Technical' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' }
]

const sortOptions = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'appliedAt-desc', label: 'Recently Applied' },
  { value: 'appliedAt-asc', label: 'Oldest Applied' },
  { value: 'stage-asc', label: 'Stage (A-Z)' },
  { value: 'stage-desc', label: 'Stage (Z-A)' }
]

export function CandidateFilters({ filters, onFiltersChange, className }: CandidateFiltersProps) {
  const handleStageChange = (value: string) => {
    const stage = value === 'all' ? undefined : value as CandidateStage
    onFiltersChange({ stage })
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [string, 'asc' | 'desc']
    onFiltersChange({ sortBy: sortBy as any, sortOrder })
  }

  const clearFilters = () => {
    onFiltersChange({
      stage: undefined,
      sortBy: undefined,
      sortOrder: undefined
    })
  }

  const hasActiveFilters = filters.stage || filters.sortBy

  const getCurrentSortValue = () => {
    if (!filters.sortBy || !filters.sortOrder) return 'appliedAt-desc'
    return `${filters.sortBy}-${filters.sortOrder}`
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Select
          value={filters.stage || 'all'}
          onValueChange={handleStageChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            {stageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={getCurrentSortValue()}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {filters.stage && (
              <Badge variant="secondary" className="gap-1">
                Stage: {stageOptions.find(opt => opt.value === filters.stage)?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ stage: undefined })}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.sortBy && (
              <Badge variant="secondary" className="gap-1">
                Sort: {sortOptions.find(opt => opt.value === getCurrentSortValue())?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ sortBy: undefined, sortOrder: undefined })}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}