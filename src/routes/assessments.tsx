import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import { PageLayout, Container } from '@/components/layout/page-layout'

export const Route = createFileRoute('/assessments')({
  component: AssessmentsPage,
})

function AssessmentsPage() {
  return (
    <MainLayout>
      <Container>
        <PageLayout
          title="Assessments"
          description="Create and manage job assessments"
        >
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Assessment Builder</h2>
            <p className="text-gray-600">Assessment creation and management functionality will be implemented here.</p>
          </div>
        </PageLayout>
      </Container>
    </MainLayout>
  )
}