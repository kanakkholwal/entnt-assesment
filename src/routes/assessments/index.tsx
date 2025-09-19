import { createFileRoute, Link } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import { PageLayout, Container } from '@/components/layout/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useJobsStore } from '@/stores/jobs'
import { useAssessmentsStore } from '@/stores/assessments'
import { useEffect } from 'react'
import { ClipboardList, Plus, Settings, FileText } from 'lucide-react'

export const Route = createFileRoute('/assessments/')({
  component: AssessmentsPage,
})

function AssessmentsPage() {
  const { jobs, fetchJobs } = useJobsStore()
  const { assessments } = useAssessmentsStore()

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const activeJobs = jobs.filter(job => job.status === 'active')

  if (activeJobs.length === 0) {
    return (
          <PageLayout
            title="Assessments"
            description="Create and manage job assessments"
          >
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <ClipboardList className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  No active jobs
                </h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                  Create some jobs first to build assessments for them
                </p>
              </div>
              <Button asChild>
                <Link to="/jobs">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Jobs
                </Link>
              </Button>
            </div>
          </PageLayout>

    )
  }

  return (
        <PageLayout
          title="Assessments"
          description="Create and manage job assessments"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeJobs.map((job) => {
              const assessment = Object.values(assessments).find(a => a.jobId === job.id)
              const questionCount = assessment?.sections.reduce((total, section) => total + section.questions.length, 0) || 0
              
              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold truncate">
                          {job.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                          Job ID: {job.id}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Assessment Status */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground dark:text-gray-400">Assessment:</span>
                      <div className="flex items-center gap-2">
                        {assessment ? (
                          <>
                            <Badge variant="outline" className="text-xs">
                              {assessment.sections.length} sections
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {questionCount} questions
                            </Badge>
                          </>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Not created
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {job.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link to="/assessments/$jobId" params={{ jobId: job.id }}>
                          {assessment ? (
                            <>
                              <Settings className="h-4 w-4 mr-2" />
                              Edit Assessment
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Assessment
                            </>
                          )}
                        </Link>
                      </Button>
                      
                      {assessment && (
                        <Button asChild variant="outline" size="sm">
                          <Link to="/take-assessment/$assessmentId/$candidateId" 
                                params={{ 
                                  assessmentId: assessment.id, 
                                  candidateId: 'preview' 
                                }}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              Click "Create Assessment" or "Edit Assessment" to build custom assessments for each job.
              Use the preview button to see how candidates will experience the assessment.
            </p>
          </div>
        </PageLayout>
     
  )
}