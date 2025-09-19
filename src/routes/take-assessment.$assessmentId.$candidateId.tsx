import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import { Container } from '@/components/layout/page-layout'
import { AssessmentRuntime } from '@/components/assessments'
import { validateParams, validators } from '@/lib/route-guards'
import { toast } from 'sonner'
import type { AssessmentResponse } from '@/types/assessment'

export const Route = createFileRoute('/take-assessment/$assessmentId/$candidateId')({
  beforeLoad: ({ params }) => {
    validateParams(params, {
      assessmentId: validators.id,
      candidateId: validators.id
    })
  },
  component: TakeAssessmentPage,
})

function TakeAssessmentPage() {
  const { assessmentId, candidateId } = Route.useParams()

  const handleSubmit = (_response: AssessmentResponse) => {
    toast.success('Assessment submitted successfully!')
    // Could redirect to a thank you page or back to candidate portal
  }

  const handleSave = (response: Partial<AssessmentResponse>) => {
    // Auto-save is handled internally by the component
    console.log('Assessment progress saved:', response)
  }

  return (
    <MainLayout>
      <Container className="py-6">
        <AssessmentRuntime
          assessmentId={assessmentId}
          candidateId={candidateId}
          onSubmit={handleSubmit}
          onSave={handleSave}
        />
      </Container>
    </MainLayout>
  )
}