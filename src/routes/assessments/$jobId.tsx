import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { AssessmentBuilder } from '@/components/assessments'
import { useAssessmentsStore } from '@/stores/assessments'
import { validateParams, validators } from '@/lib/route-guards'
import { toast } from 'sonner'
import { useEffect } from 'react'
import type { Assessment } from '@/types/assessment'

export const Route = createFileRoute('/assessments/$jobId')({
  beforeLoad: ({ params }) => {
    validateParams(params, {
      jobId: validators.id
    })
  },
  component: AssessmentBuilderPage,
})

function AssessmentBuilderPage() {
  const { jobId } = Route.useParams()
  const { assessments, fetchAssessment, updateAssessment } = useAssessmentsStore()

  // Get assessment for this job
  const assessment = Object.values(assessments).find(a => a.jobId === jobId)

  useEffect(() => {
    fetchAssessment(jobId).catch(() => {
      // Assessment might not exist yet, which is fine
    })
  }, [jobId, fetchAssessment])

  const handleSave = async (assessment: Assessment) => {
    try {
      await updateAssessment(jobId, assessment)
      toast.success('Assessment saved successfully')
    } catch (error) {
      toast.error('Failed to save assessment')
      throw error
    }
  }

  return (
        <PageLayout
          title={`Assessment Builder`}
          description="Create and edit assessments for this job"
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link to="/assessments">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Assessments
              </Link>
            </Button>
          }
        >
          <div className="h-[calc(100vh-200px)]">
            <AssessmentBuilder
              jobId={jobId}
              assessment={assessment}
              onSave={handleSave}
              className="h-full"
            />
          </div>
        </PageLayout>
   
  )
}