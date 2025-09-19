import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import { Container } from '@/components/layout/page-layout'
import { JobsBoardDraggable, JobForm } from '@/components/jobs'
import { useJobsStore } from '@/stores/jobs'
import { toast } from 'sonner'
import type { Job, CreateJobRequest, UpdateJobRequest } from '@/types/job'

export const Route = createFileRoute('/jobs')({
  component: JobsPage,
})

function JobsPage() {
  const navigate = useNavigate()
  const { createJob, updateJob } = useJobsStore()
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleJobSelect = (job: Job) => {
    navigate({ to: '/jobs/$jobId', params: { jobId: job.id } })
  }

  const handleCreateJob = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
  }

  const handleCreateSubmit = async (data: CreateJobRequest | UpdateJobRequest) => {
    setIsSubmitting(true)
    try {
      await createJob(data as CreateJobRequest)
      toast.success('Job created successfully!')
    } catch (error) {
      toast.error('Failed to create job. Please try again.')
      throw error // Re-throw to prevent modal from closing
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (data: CreateJobRequest | UpdateJobRequest) => {
    if (!editingJob) return
    
    setIsSubmitting(true)
    try {
      await updateJob(editingJob.id, data as UpdateJobRequest)
      toast.success('Job updated successfully!')
      setEditingJob(null)
    } catch (error) {
      toast.error('Failed to update job. Please try again.')
      throw error // Re-throw to prevent modal from closing
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <Container>
        <JobsBoardDraggable
          onJobSelect={handleJobSelect}
          onCreateJob={handleCreateJob}
          onEditJob={handleEditJob}
        />

        {/* Create Job Modal */}
        <JobForm
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateSubmit}
          loading={isSubmitting}
        />

        {/* Edit Job Modal */}
        <JobForm
          job={editingJob || undefined}
          open={!!editingJob}
          onOpenChange={(open) => !open && setEditingJob(null)}
          onSubmit={handleEditSubmit}
          loading={isSubmitting}
        />
      </Container>
    </MainLayout>
  )
}