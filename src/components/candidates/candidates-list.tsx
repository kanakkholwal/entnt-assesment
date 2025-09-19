import { useEffect, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCandidatesStore } from '@/stores/candidates'
import { CandidateCard } from './candidate-card'
import { CandidateSearch } from './candidate-search'
import { CandidateFilters } from './candidate-filters'
import { Button } from '@/components/ui/button'
import { RefreshCw, Users } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import type { Candidate } from '@/types/candidate'
import { cn } from '@/lib/utils'

interface CandidatesListProps {
  className?: string
}

export function CandidatesList({ className }: CandidatesListProps) {
  const navigate = useNavigate()
  const parentRef = useRef<HTMLDivElement>(null)

  const {
    candidates,
    loading,
    error,
    filters,
    pagination,
    fetchCandidates,
    setFilters
  } = useCandidatesStore()

  // Filter candidates client-side for search
  const filteredCandidates = useMemo(() => {
    if (!filters.search) return candidates

    const searchTerm = filters.search.toLowerCase()
    return candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm) ||
      candidate.email.toLowerCase().includes(searchTerm)
    )
  }, [candidates, filters.search])

  // Virtual list configuration
  const virtualizer = useVirtualizer({
    count: filteredCandidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated height of each candidate card (104px content + 16px padding)
    overscan: 5, // Render 5 extra items outside viewport for smooth scrolling
  })

  // Fetch candidates on mount and when filters change (except search)
  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  const handleCandidateClick = (candidate: Candidate) => {
    navigate({ to: '/candidates/$id', params: { id: candidate.id } })
  }

  const handleSearchChange = (search: string) => {
    setFilters({ search })
  }

  const handleFiltersChange = (newFilters: Parameters<typeof setFilters>[0]) => {
    setFilters(newFilters)
  }

  const handleRefresh = () => {
    fetchCandidates()
  }



  return (
    <div className={cn('flex flex-col h-ful', className)}>
      {/* Header with search and filters */}
      <div className="flex-shrink-0 space-y-4 p-4 border-b bg-card sticky top-[65px] z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Candidates
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredCandidates.length} of {pagination.total} candidates
            </p>
          </div>

          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <CandidateSearch
          value={filters.search || ''}
          onChange={handleSearchChange}
          className="w-full"
        />

        <CandidateFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>


      {!loading && (
        error ? <div className={cn('flex flex-col items-center justify-center py-12 bg-card rounded-xl my-10', className)}>
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to load candidates
          </h3>
          <p className="text-muted-foreground mb-4">
            {error}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw  />
            Try again
          </Button>
        </div>
      </div> : <div className="flex-1 overflow-hidden">
        {/* Virtualized list */}

        {filteredCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="text-center">
              <Users className="size-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {filters.search || filters.stage ? 'No candidates found' : 'No candidates yet'}
              </h3>
              <p className="text-muted-foreground">
                {filters.search || filters.stage
                  ? 'Try adjusting your search or filters'
                  : 'Candidates will appear here once they apply to jobs'
                }
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={parentRef}
            className="h-full overflow-auto bg-muted"
           
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const candidate = filteredCandidates[virtualItem.index]

                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <div className="p-4">
                      <CandidateCard
                        candidate={candidate}
                        onClick={handleCandidateClick}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>)}
      {/* Loading overlay */}
      {loading && (
        <div className="bg-card py-12 w-full rounded-xl flex items-center justify-center my-10">
          <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
            <RefreshCw className="size-4 animate-spin" />
            Loading candidates...
          </div>
        </div>
      )}
    </div>
  )
}