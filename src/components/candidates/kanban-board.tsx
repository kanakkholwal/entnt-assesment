import { useState, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RefreshCw, GripVertical } from 'lucide-react'
import { useCandidatesStore } from '@/stores/candidates'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import type { Candidate, CandidateStage } from '@/types/candidate'
import { cn } from '@/lib/utils'

// Stage configuration
const STAGES: Array<{
  id: CandidateStage
  title: string
  color: string
  bgColor: string
}> = [
  { id: 'applied', title: 'Applied', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  { id: 'screen', title: 'Screening', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
  { id: 'tech', title: 'Technical', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  { id: 'offer', title: 'Offer', color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200' },
  { id: 'hired', title: 'Hired', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  { id: 'rejected', title: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
]

interface DraggableCandidateCardProps {
  candidate: Candidate
  onClick?: (candidate: Candidate) => void
  isDragging?: boolean
}

function DraggableCandidateCard({ candidate, onClick, isDragging }: DraggableCandidateCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: candidate.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleClick = () => {
    if (!isDragging && !isSortableDragging && onClick) {
      onClick(candidate)
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card 
        className={cn(
          "cursor-pointer hover:shadow-md transition-all duration-200 border-l-4",
          isDragging || isSortableDragging ? "shadow-lg scale-105" : "",
          "border-l-blue-500"
        )}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                  {getInitials(candidate.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {candidate.name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {candidate.email}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-3 w-3 text-gray-400" />
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Applied {formatDistanceToNow(candidate.appliedAt, { addSuffix: true })}</span>
            {candidate.notes && candidate.notes.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {candidate.notes.length} note{candidate.notes.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface KanbanColumnProps {
  stage: typeof STAGES[0]
  candidates: Candidate[]
  onCandidateClick?: (candidate: Candidate) => void
  activeId?: string | null
}

function KanbanColumn({ stage, candidates, onCandidateClick, activeId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
  })

  return (
    <div className="flex flex-col h-full min-w-[280px] max-w-[320px]">
      <Card className={cn("flex-1 flex flex-col", stage.bgColor, isOver && "ring-2 ring-blue-500 ring-opacity-50")}>
        <CardHeader className="pb-3">
          <CardTitle className={cn("text-sm font-medium flex items-center justify-between", stage.color)}>
            <span>{stage.title}</span>
            <Badge variant="secondary" className="ml-2">
              {candidates.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 pt-0 pb-4" ref={setNodeRef}>
          <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 min-h-[200px]">
              {candidates.map((candidate) => (
                <DraggableCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onClick={onCandidateClick}
                  isDragging={activeId === candidate.id}
                />
              ))}
              
              {candidates.length === 0 && (
                <div className={cn(
                  "flex items-center justify-center h-32 text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg transition-colors",
                  isOver && "border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                )}>
                  <p className="text-sm">
                    {isOver ? "Drop candidate here" : "No candidates"}
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  )
}

interface KanbanBoardProps {
  className?: string
}

export function KanbanBoard({ className }: KanbanBoardProps) {
  const navigate = useNavigate()
  const {
    candidates,
    loading,
    error,
    fetchCandidates,
    updateCandidateStage,
  } = useCandidatesStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

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

  // Group candidates by stage
  const candidatesByStage = useMemo(() => {
    const grouped = STAGES.reduce((acc, stage) => {
      acc[stage.id] = candidates.filter(candidate => candidate.stage === stage.id)
      return acc
    }, {} as Record<CandidateStage, Candidate[]>)
    
    return grouped
  }, [candidates])

  const activeCandidate = activeId ? candidates.find(c => c.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }



  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) {
      return
    }

    const candidateId = active.id as string
    const candidate = candidates.find(c => c.id === candidateId)
    
    if (!candidate) {
      return
    }

    // Determine the target stage
    let targetStage: CandidateStage | null = null
    
    // Check if dropped on another candidate (same stage)
    const targetCandidate = candidates.find(c => c.id === over.id)
    if (targetCandidate) {
      targetStage = targetCandidate.stage
    } else {
      // Check if dropped on a stage column (droppable area)
      const stageMatch = STAGES.find(stage => over.id === `stage-${stage.id}`)
      if (stageMatch) {
        targetStage = stageMatch.id
      }
    }

    // If no valid target stage or same stage, do nothing
    if (!targetStage || candidate.stage === targetStage) {
      return
    }

    setIsUpdating(true)

    try {
      await updateCandidateStage(candidateId, targetStage)
      toast.success(`Moved ${candidate.name} to ${STAGES.find(s => s.id === targetStage)?.title}`)
    } catch (error) {
      toast.error('Failed to update candidate stage. Please try again.')
      console.error('Failed to update candidate stage:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCandidateClick = (candidate: Candidate) => {
    navigate({ to: '/candidates/$id', params: { id: candidate.id } })
  }

  const handleRefresh = () => {
    fetchCandidates()
  }

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <RefreshCw className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Failed to load candidates
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Candidate Pipeline
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag candidates between stages to update their status
            </p>
          </div>
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading || isUpdating}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", (loading || isUpdating) && "animate-spin")} />
            {isUpdating ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto">
          <div className="flex gap-4 p-4 min-w-max h-full">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {STAGES.map((stage) => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  candidates={candidatesByStage[stage.id] || []}
                  onCandidateClick={handleCandidateClick}
                  activeId={activeId}
                />
              ))}

              <DragOverlay>
                {activeCandidate ? (
                  <div className="rotate-3 scale-105">
                    <DraggableCandidateCard
                      candidate={activeCandidate}
                      isDragging={true}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {(loading || isUpdating) && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {isUpdating ? 'Updating candidate...' : 'Loading candidates...'}
          </div>
        </div>
      )}
    </div>
  )
}