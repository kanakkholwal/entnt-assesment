import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Mail, User, MessageSquare, FileText } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { useCandidatesStore } from '@/stores/candidates'
import { useJobsStore } from '@/stores/jobs'
import { useAssessmentsStore } from '@/stores/assessments'
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

export function CandidateProfile({ candidateId }: CandidateProfileProps) {
    if (!candidateId) {
        throw new Error('CandidateProfile requires a candidateId prop')
    }

    const [candidate, setCandidate] = useState<Candidate | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { fetchCandidates, getCandidateById } = useCandidatesStore()
    const { jobs, fetchJobs } = useJobsStore()
    const { assessments, fetchAssessment } = useAssessmentsStore()

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                setError(null)
                
                // Ensure candidates and jobs are loaded
                await Promise.all([
                    fetchCandidates(),
                    fetchJobs()
                ])
                
                const foundCandidate = await getCandidateById(candidateId)
                if (foundCandidate) {
                    setCandidate(foundCandidate)
                    // Fetch assessment for this candidate's job
                    try {
                        await fetchAssessment(foundCandidate.jobId)
                    } catch (assessmentError) {
                        console.log('No assessment found for job:', foundCandidate.jobId)
                    }
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
    }, [candidateId, getCandidateById, fetchCandidates, fetchJobs, fetchAssessment])

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
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/candidates">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Candidates
                        </Link>
                    </Button>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {candidate.name}
                        </h1>
                        <p className="text-muted-foreground">
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
                                    <div className="flex items-center gap-1 text-muted-foreground ">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-sm">{candidate.email}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground ">
                                        Position
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {getJobTitle(candidate.jobId)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
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
                                    <span className="text-sm font-medium text-muted-foreground">
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
                                    <span className="text-sm font-medium text-muted-foreground ">
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

                    {/* Assessment Section */}
                    {(() => {
                        const jobAssessment = Object.values(assessments).find(a => a.jobId === candidate.jobId)
                        if (jobAssessment) {
                            return (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Assessment
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-medium text-sm">{jobAssessment.title}</h4>
                                            <p className="text-sm text-muted-foreground  mt-1">
                                                Complete the assessment for this position to proceed with your application.
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {jobAssessment.sections.length} section{jobAssessment.sections.length !== 1 ? 's' : ''} • {' '}
                                            {jobAssessment.sections.reduce((total, section) => total + section.questions.length, 0)} questions
                                        </div>
                                        <Button asChild className="w-full">
                                            <Link to="/take-assessment/$assessmentId/$candidateId" 
                                                  params={{ 
                                                    assessmentId: jobAssessment.id, 
                                                    candidateId: candidate.id 
                                                  }}>
                                                Take Assessment
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        }
                        return null
                    })()}

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