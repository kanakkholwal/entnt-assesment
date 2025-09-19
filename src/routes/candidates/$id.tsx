import { createFileRoute } from '@tanstack/react-router'
import { CandidateProfile } from '@/components/candidates'
import { validateParams, validators } from '@/lib/route-guards'

export const Route = createFileRoute('/candidates/$id')({
  beforeLoad: ({ params }) => {
    validateParams(params, { id: validators.id })
  },
  component: CandidateDetailPage,
})

function CandidateDetailPage() {
  const { id } = Route.useParams()
  return (<CandidateProfile candidateId={id} />)
}