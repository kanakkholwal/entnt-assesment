import React, { useMemo, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Archive, ArchiveRestore, Edit, Eye, MoreHorizontal, ClipboardList } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from '@tanstack/react-router'
import type { Job, UpdateJobRequest } from '@/types/job'
import { JobForm } from './job-form'

interface JobCardProps {
  job: Job
  onEdit: (job: UpdateJobRequest) => Promise<void>
  onToggleStatus?: (job: Job) => void
  onView?: (job: Job) => void
  draggable?: boolean
}

export const JobCard = React.memo<JobCardProps>(function JobCard({
  job,
  onEdit,
  onToggleStatus,
  onView,
  draggable = false
}) {
  const isActive = useMemo(() => job.status === 'active', [job.status])

  // Memoize formatted dates to avoid recalculating on every render
  const formattedDates = useMemo(() => {
    const createdAt = new Date(job.createdAt)
    const updatedAt = new Date(job.updatedAt)
    
    return {
      created: formatDistanceToNow(createdAt, { addSuffix: true }),
      updated: job.updatedAt !== job.createdAt 
        ? formatDistanceToNow(updatedAt, { addSuffix: true })
        : null
    }
  }, [job.createdAt, job.updatedAt])

  // Memoize card classes to avoid string concatenation on every render
  const cardClasses = useMemo(() => {
    const baseClasses = 'transition-all duration-200 hover:shadow-md'
    const draggableClasses = draggable ? 'cursor-grab active:cursor-grabbing' : ''
    const statusClasses = !isActive ? 'opacity-75' : ''
    
    return [baseClasses, draggableClasses, statusClasses].filter(Boolean).join(' ')
  }, [draggable, isActive])

  // Memoize handlers to prevent unnecessary re-renders of child components
  const handleEdit = useCallback(() => {
    onEdit?.(job)
  }, [onEdit, job])

  const handleToggleStatus = useCallback(() => {
    onToggleStatus?.(job)
  }, [onToggleStatus, job])

  const handleView = useCallback(() => {
    onView?.(job)
  }, [onView, job])

  // Memoize tag badges to avoid re-rendering when tags haven't changed
  const tagBadges = useMemo(() => {
    return job.tags.map((tag) => (
      <Badge key={tag} variant="outline" className="text-xs">
        {tag}
      </Badge>
    ))
  }, [job.tags])

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold leading-none tracking-tight">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              /{job.slug}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isActive ? 'default_light' : 'secondary'} className='uppercase'>
              {job.status}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/assessments/$jobId" params={{ jobId: job.id }}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Assessment
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit} asChild>
                  <JobForm
                    job={job}
                    onSubmit={onEdit}
                    onOpenChange={() => { }}
                    btnProps={{
                      variant: 'raw',
                      className: 'w-full justify-start !pl-2 gap-4 font-medium text--muted-foreground hover:bg-accent',
                      children: (
                        <>
                          <Edit  />
                          Edit Job
                        </>
                      )
                    
                    }}
                  />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleStatus}>
                  {isActive ? (
                    <>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Job
                    </>
                  ) : (
                    <>
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                      Activate Job
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {(job.description || job.tags.length > 0) && (
        <CardContent className="pb-3">
          {job.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {job.description}
            </p>
          )}

          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tagBadges}
            </div>
          )}
        </CardContent>
      )}

      <CardFooter className="pt-3 text-xs text-muted-foreground">
        <div className="flex items-center justify-between w-full">
          <span>
            Created {formattedDates.created}
          </span>
          {formattedDates.updated && (
            <span>
              Updated {formattedDates.updated}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
})