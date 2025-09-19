import { useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, RefreshCw } from 'lucide-react'
import { useJobsStore } from '@/stores/jobs'
import { JobCard } from './job-card'
import { JobSearch } from './job-search'
import { JobFilters } from './job-filters'
import { JobPagination } from './job-pagination'
import type { Job } from '@/types/job'

interface JobsBoardProps {
  onJobSelect?: (job: Job) => void
  onCreateJob?: () => void
  onEditJob?: (job: Job) => void
}

export function JobsBoard({ onJobSelect, onCreateJob, onEditJob }: JobsBoardProps) {
  const {
    jobs,
    loading,
    error,
    filters,
    pagination,
    fetchJobs,
    setFilters,
    setPagination,
    updateJob,
  } = useJobsStore()

  // Fetch jobs on mount and when filters/pagination change
  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Get unique tags from all jobs for filter options
  const availableTags = useMemo(() => {
    const allTags = jobs.flatMap(job => job.tags)
    return Array.from(new Set(allTags)).sort()
  }, [jobs])

  const handleSearchChange = (search: string) => {
    setFilters({ search })
  }

  const handleFiltersChange = (newFilters: Parameters<typeof setFilters>[0]) => {
    setFilters(newFilters)
  }

  const handlePaginationChange = (newPagination: Parameters<typeof setPagination>[0]) => {
    setPagination(newPagination)
  }

  const handleToggleJobStatus = async (job: Job) => {
    try {
      const newStatus = job.status === 'active' ? 'archived' : 'active'
      await updateJob(job.id, { status: newStatus })
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to toggle job status:', error)
    }
  }

  const handleRefresh = () => {
    fetchJobs()
  }

  const renderJobsGrid = () => {
    if (loading && jobs.length === 0) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <div className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )
    }

    if (jobs.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold">No jobs found</h3>
              <p className="text-muted-foreground">
                {filters.search || filters.status !== 'all' || (filters.tags?.length ?? 0) > 0
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating your first job posting.'}
              </p>
              {onCreateJob && (
                <Button onClick={onCreateJob} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Job
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onEdit={onEditJob}
            onToggleStatus={handleToggleJobStatus}
            onView={onJobSelect}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">
            Manage your job postings and requirements
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {onCreateJob && (
            <Button onClick={onCreateJob}>
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-sm">
          <JobSearch
            value={filters.search || ''}
            onChange={handleSearchChange}
            placeholder="Search jobs by title..."
          />
        </div>
        
        <JobFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableTags={availableTags}
        />
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Jobs Grid */}
      <div className="relative">
        {loading && jobs.length > 0 && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-background border rounded-lg px-4 py-2 shadow-lg">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Updating...</span>
            </div>
          </div>
        )}
        
        {renderJobsGrid()}
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <JobPagination
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
        />
      )}
    </div>
  )
}