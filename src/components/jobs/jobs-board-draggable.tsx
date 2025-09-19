import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GripVertical, Plus, RefreshCw } from 'lucide-react'
import { useJobsStore } from '@/stores/jobs'
import { JobCard } from './job-card'
import { toast } from 'sonner'
import type { Job } from '@/types/job'

interface DraggableJobCardProps {
  job: Job
  onEdit?: (job: Job) => void
  onToggleStatus?: (job: Job) => void
  onView?: (job: Job) => void
  isDragging?: boolean
}

function DraggableJobCard({ job, onEdit, onToggleStatus, onView, isDragging }: DraggableJobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="absolute left-2 top-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing hover:bg-muted/50"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      
      <div className="pl-8">
        <JobCard
          job={job}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onView={onView}
          draggable={true}
        />
      </div>
    </div>
  )
}

interface JobsBoardDraggableProps {
  onJobSelect?: (job: Job) => void
  onCreateJob?: () => void
  onEditJob?: (job: Job) => void
}

export function JobsBoardDraggable({ onJobSelect, onCreateJob, onEditJob }: JobsBoardDraggableProps) {
  const {
    jobs,
    loading,
    error,
    fetchJobs,
    updateJob,
    reorderJobs,
  } = useJobsStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Sort jobs by order for consistent display
  const sortedJobs = [...jobs].sort((a, b) => a.order - b.order)
  const activeJob = activeId ? jobs.find(job => job.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sortedJobs.findIndex(job => job.id === active.id)
    const newIndex = sortedJobs.findIndex(job => job.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Calculate the new order values
    const fromOrder = sortedJobs[oldIndex].order
    const toOrder = sortedJobs[newIndex].order

    setIsReordering(true)

    try {
      await reorderJobs(fromOrder, toOrder)
      toast.success('Job order updated successfully!')
    } catch (error) {
      toast.error('Failed to reorder jobs. Please try again.')
      console.error('Reorder error:', error)
    } finally {
      setIsReordering(false)
    }
  }

  const handleToggleJobStatus = async (job: Job) => {
    try {
      const newStatus = job.status === 'active' ? 'archived' : 'active'
      await updateJob(job.id, { status: newStatus })
      toast.success(`Job ${newStatus === 'active' ? 'activated' : 'archived'} successfully!`)
    } catch (error) {
      toast.error('Failed to update job status. Please try again.')
      console.error('Failed to toggle job status:', error)
    }
  }

  const handleRefresh = () => {
    fetchJobs()
  }

  if (jobs.length === 0 && !loading) {
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

        {/* Empty State */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold">No jobs found</h3>
              <p className="text-muted-foreground">
                Get started by creating your first job posting.
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
            Drag and drop to reorder • Manage your job postings and requirements
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || isReordering}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${(loading || isReordering) ? 'animate-spin' : ''}`} />
            {isReordering ? 'Reordering...' : 'Refresh'}
          </Button>
          
          {onCreateJob && (
            <Button onClick={onCreateJob} disabled={isReordering}>
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          )}
        </div>
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

      {/* Draggable Jobs List */}
      <div className="relative">
        {(loading || isReordering) && jobs.length > 0 && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-background border rounded-lg px-4 py-2 shadow-lg">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">
                {isReordering ? 'Updating order...' : 'Loading...'}
              </span>
            </div>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedJobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {sortedJobs.map((job) => (
                <DraggableJobCard
                  key={job.id}
                  job={job}
                  onEdit={onEditJob}
                  onToggleStatus={handleToggleJobStatus}
                  onView={onJobSelect}
                  isDragging={activeId === job.id}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeJob ? (
              <div className="rotate-3 scale-105">
                <JobCard
                  job={activeJob}
                  draggable={true}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}