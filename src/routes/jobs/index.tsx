import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import { Container } from '@/components/layout/page-layout'
import { JobsBoardDraggable } from '@/components/jobs'
import type { Job,  } from '@/types/job'

export const Route = createFileRoute('/jobs/')({
  component: JobsPage,
})

function JobsPage() {
  const navigate = useNavigate()


  const handleJobSelect = (job: Job) => {
    navigate({ to: '/jobs/$jobId', params: { jobId: job.id } })
  }



 

  return ( <JobsBoardDraggable
          onJobSelect={handleJobSelect}
          onCreateJob={() =>{}}
          onEditJob={() =>{
            console.log('edit job')
            return Promise.resolve()
          }}
        />)
}