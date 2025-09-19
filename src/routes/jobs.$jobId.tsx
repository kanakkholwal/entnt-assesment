import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import { PageLayout, Container } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { validateParams, validators } from '@/lib/route-guards'

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

  return (
    <MainLayout>
      <Container>
        <PageLayout
          title={`Job Details - ${jobId}`}
          description="View and manage job details"
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link to="/jobs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Link>
            </Button>
          }
        >
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Job ID: {jobId}</h2>
            <p className="text-gray-600">Job detail functionality will be implemented here.</p>
          </div>
        </PageLayout>
      </Container>
    </MainLayout>
  )
}