import { createFileRoute, Link } from '@tanstack/react-router'
import { PageLayout } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ClipboardList, Users, Calendar } from 'lucide-react'
import { validateParams, validators } from '@/lib/route-guards'
import { useJobsStore } from '@/stores/jobs'
import { useAssessmentsStore } from '@/stores/assessments'
import { useCandidatesStore } from '@/stores/candidates'
import { useEffect } from 'react'

export const Route = createFileRoute('/jobs/$jobId')({
  beforeLoad: ({ params }) => {
    validateParams(params, {
      jobId: validators.id
    })
  },
  component: JobDetailPage,
})

function JobDetailPage() {
  const { jobId } = Route.useParams()
  const { jobs, fetchJobs } = useJobsStore()
  const { assessments } = useAssessmentsStore()
  const { candidates, fetchCandidates } = useCandidatesStore()

  useEffect(() => {
    fetchJobs()
    fetchCandidates()
  }, [fetchJobs, fetchCandidates])

  const job = jobs.find(j => j.id === jobId)
  const assessment = Object.values(assessments).find(a => a.jobId === jobId)
  const jobCandidates = candidates.filter(c => c.jobId === jobId)

  if (!job) {
    return (
          <PageLayout
            title="Job Not Found"
            description="The requested job could not be found"
            actions={
              <Button variant="outline" size="sm" asChild>
                <Link to="/jobs">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Jobs
                </Link>
              </Button>
            }
          >
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Job not found</h2>
              <p className="text-muted-foreground">The job with ID "{jobId}" does not exist.</p>
            </div>
          </PageLayout>
    )
  }

  const questionCount = assessment?.sections.reduce((total, section) => total + section.questions.length, 0) || 0

  return (
        <PageLayout
          title={job.title}
          description={`Job details and management for ${job.title}`}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/assessments/$jobId" params={{ jobId }}>
                  <ClipboardList className="size-4 mr-2" />
                  {assessment ? 'Edit Assessment' : 'Create Assessment'}
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/jobs">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Jobs
                </Link>
              </Button>
            </div>
          }
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Job Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Job Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm">{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Updated:</span>
                  <span className="text-sm">{new Date(job.updatedAt).toLocaleDateString()}</span>
                </div>
                {job.tags && job.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground block mb-2">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assessment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assessment ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sections:</span>
                      <Badge variant="outline">{assessment.sections.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Questions:</span>
                      <Badge variant="outline">{questionCount}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Updated:</span>
                      <span className="text-sm">{new Date(assessment.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="pt-2">
                      <Button asChild size="sm" className="w-full">
                        <Link to="/assessments/$jobId" params={{ jobId }}>
                          Edit Assessment
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      No assessment created for this job yet.
                    </p>
                    <Button asChild size="sm" className="w-full">
                      <Link to="/assessments/$jobId" params={{ jobId }}>
                        Create Assessment
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Candidates Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Candidates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <Badge variant="outline">{jobCandidates.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Applied:</span>
                  <Badge variant="outline">
                    {jobCandidates.filter(c => c.stage === 'applied').length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">In Process:</span>
                  <Badge variant="outline">
                    {jobCandidates.filter(c => ['screen', 'tech', 'offer'].includes(c.stage)).length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hired:</span>
                  <Badge variant="outline">
                    {jobCandidates.filter(c => c.stage === 'hired').length}
                  </Badge>
                </div>
                <div className="pt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/candidates" search={{ jobId }}>
                      View Candidates
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Description */}
          {job.description && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="text-muted-foreground">
                      {requirement}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </PageLayout>
     
  )
}