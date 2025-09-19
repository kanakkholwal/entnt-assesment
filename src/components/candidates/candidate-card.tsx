import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import type { Candidate } from '@/types/candidate'

interface CandidateCardProps {
  candidate: Candidate
  onClick?: (candidate: Candidate) => void
}

const stageColors = {
  applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  screen: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  tech: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  offer: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  hired: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const stageLabels = {
  applied: 'Applied',
  screen: 'Screening',
  tech: 'Technical',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected'
}

export const CandidateCard = memo<CandidateCardProps>(({ candidate, onClick }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleClick = () => {
    onClick?.(candidate)
  }

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(candidate.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {candidate.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {candidate.email}
                </p>
              </div>
              
              <Badge 
                variant="secondary" 
                className={`flex-shrink-0 ${stageColors[candidate.stage]}`}
              >
                {stageLabels[candidate.stage]}
              </Badge>
            </div>
            
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Applied {formatDistanceToNow(new Date(candidate.appliedAt), { addSuffix: true })}
              </span>
              
              {candidate.notes && candidate.notes.length > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  {candidate.notes.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

CandidateCard.displayName = 'CandidateCard'