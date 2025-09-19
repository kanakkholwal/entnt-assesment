import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import { PageLayout, Container } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { validateParams, validators } from '@/lib/route-guards'

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

  return (
    <MainLayout>
      <Container>
        <PageLayout
          title={`Assessment Builder - Job ${jobId}`}
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
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Job ID: {jobId}</h2>
            <p className="text-gray-600">Assessment builder functionality will be implemented here.</p>
          </div>
        </PageLayout>
      </Container>
    </MainLayout>
  )
}