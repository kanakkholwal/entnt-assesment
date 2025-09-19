import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { PaginationState } from '@/types/common'

interface JobPaginationProps {
  pagination: PaginationState
  onPaginationChange: (pagination: Partial<PaginationState>) => void
}

const pageSizeOptions = [10, 20, 50, 100]

export function JobPagination({ pagination, onPaginationChange }: JobPaginationProps) {
  const { page, limit, total, totalPages } = pagination
  
  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)
  
  const canGoPrevious = page > 1
  const canGoNext = page < totalPages
  
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPaginationChange({ page: newPage })
    }
  }
  
  const changePageSize = (newLimit: string) => {
    onPaginationChange({ 
      limit: parseInt(newLimit, 10),
      page: 1 // Reset to first page when changing page size
    })
  }

  if (total === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select value={limit.toString()} onValueChange={changePageSize}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {startItem}-{endItem} of {total}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => goToPage(1)}
            disabled={!canGoPrevious}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => goToPage(page - 1)}
            disabled={!canGoPrevious}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {page} of {totalPages}
          </div>
          
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => goToPage(page + 1)}
            disabled={!canGoNext}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => goToPage(totalPages)}
            disabled={!canGoNext}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}