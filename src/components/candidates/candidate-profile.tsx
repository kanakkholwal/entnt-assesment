import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Mail, User, MessageSquare } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { useCandidatesStore } from '@/stores/candidates'
import { useJobsStore } from '@/stores/jobs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CandidateTimeline } from './candidate-timeline'
import { CandidateNotes } from './candidate-notes'
import type { Candidate } from '@/types/candidate'

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

interface CandidateProfileProps {
    candidateId?: string
}

export function CandidateProfile({ candidateId: propCandidateId }: CandidateProfileProps) {
    const params = useParams({ from: '/candidates/$id' })
    const candidateId = propCandidateId || params.id

    const [candidate, setCandidate] = useState<Candidate | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { candidates, fetchCandidates } = useCandidatesStore()
    const { jobs, fetchJobs } = useJobsStore()

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch candidates if not already loaded
                if (candidates.length === 0) {
                    await fetchCandidates()
                }

                // Fetch jobs if not already loaded
                if (jobs.length === 0) {
                    await fetchJobs()
                }

                // Find the candidate
                const foundCandidate = candidates.find(c => c.id === candidateId)
                if (foundCandidate) {
                    setCandidate(foundCandidate)
                } else {
                    setError('Candidate not found')
                }
            } catch (err) {
                setError('Failed to load candidate data')
                console.error('Error loading candidate:', err)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [candidateId, candidates, jobs, fetchCandidates, fetchJobs])

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getJobTitle = (jobId: string) => {
        const job = jobs.find(j => j.id === jobId)
        return job?.title || 'Unknown Position'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (error || !candidate) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    {error || 'Candidate not found'}
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/candidates">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Candidates
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {candidate.name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Candidate Profile
                        </p>
                    </div>
                </div>

                <Badge
                    variant="secondary"
                    className={`${stageColors[candidate.stage]} text-sm px-3 py-1`}
                >
                    {stageLabels[candidate.stage]}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Candidate Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Candidate Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                                        {getInitials(candidate.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-sm">{candidate.email}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Position
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {getJobTitle(candidate.jobId)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Current Stage
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className={stageColors[candidate.stage]}
                                    >
                                        {stageLabels[candidate.stage]}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Applied
                                    </span>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold">
                                            {format(new Date(candidate.appliedAt), 'MMM d, yyyy')}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(candidate.appliedAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Notes
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-semibold">
                                            {candidate.notes?.length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes Section */}
                    <CandidateNotes candidate={candidate} />
                </div>

                {/* Right Column - Timeline */}
                <div className="lg:col-span-2">
                    <CandidateTimeline candidate={candidate} />
                </div>
            </div>
        </div>
    )
}