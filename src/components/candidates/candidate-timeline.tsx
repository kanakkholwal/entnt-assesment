import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle, 
  Calendar,
  ArrowRight,
  FileText
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import type { Candidate, TimelineEvent } from '@/types/candidate'

interface CandidateTimelineProps {
  candidate: Candidate
}

const timelineIcons = {
  stage_change: ArrowRight,
  note_added: MessageSquare,
  assessment_completed: CheckCircle,
  interview_scheduled: Calendar,
  default: FileText
}

const timelineColors = {
  stage_change: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
  note_added: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
  assessment_completed: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
  interview_scheduled: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
  default: 'text-muted-foreground bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
}

export function CandidateTimeline({ candidate }: CandidateTimelineProps) {
  const sortedTimeline = [...(candidate.timeline || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const getTimelineIcon = (type: TimelineEvent['type']) => {
    return timelineIcons[type] || timelineIcons.default
  }

  const getTimelineColor = (type: TimelineEvent['type']) => {
    return timelineColors[type] || timelineColors.default
  }

  const formatTimelineDescription = (event: TimelineEvent) => {
    switch (event.type) {
      case 'stage_change':
        if (event.metadata?.previousStage && event.metadata?.newStage) {
          return `Stage changed from ${event.metadata.previousStage} to ${event.metadata.newStage}`
        }
        return event.description
      case 'note_added':
        return 'Added a note'
      case 'assessment_completed':
        return 'Completed assessment'
      case 'interview_scheduled':
        return 'Interview scheduled'
      default:
        return event.description
    }
  }

  const getEventBadge = (event: TimelineEvent) => {
    switch (event.type) {
      case 'stage_change':
        return (
          <Badge variant="secondary" className="text-xs">
            Stage Change
          </Badge>
        )
      case 'note_added':
        return (
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Note
          </Badge>
        )
      case 'assessment_completed':
        return (
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            Assessment
          </Badge>
        )
      case 'interview_scheduled':
        return (
          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
            Interview
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Event
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTimeline.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No timeline events yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTimeline.map((event, index) => {
              const Icon = getTimelineIcon(event.type)
              const colorClass = getTimelineColor(event.type)
              const isLast = index === sortedTimeline.length - 1

              return (
                <div key={event.id} className="relative">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200 dark:bg-gray-700" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
                      <Icon className="size-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getEventBadge(event)}
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(event.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                          
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {formatTimelineDescription(event)}
                          </p>
                          
                          {event.createdBy && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>by {event.createdBy}</span>
                            </div>
                          )}
                          
                          {/* Additional metadata */}
                          {event.metadata && Object.keys(event.metadata).length > 0 && (
                            <div className="mt-2 p-2 bg-input rounded text-xs">
                              {Object.entries(event.metadata).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-muted-foreground  capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                  </span>
                                  <span className="font-medium">
                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!isLast && <Separator className="mt-4" />}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}