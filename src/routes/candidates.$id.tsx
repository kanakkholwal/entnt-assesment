import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import { Container } from '@/components/layout/page-layout'
import { CandidateProfile } from '@/components/candidates'
import { validateParams, validators } from '@/lib/route-guards'

export const Route = createFileRoute('/candidates/$id')({
  beforeLoad: ({ params }) => {
    validateParams(params, {
      id: validators.id
    })
  },
  component: CandidateDetailPage,
})

function CandidateDetailPage() {
  return (
    <MainLayout>
      <Container>
        <CandidateProfile />
      </Container>
    </MainLayout>
  )
}