import { useState } from 'react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import { Container } from '@/components/layout/page-layout'
import { CandidatesList, KanbanBoard } from '@/components/candidates'
import { Button } from '@/components/ui/button'
import { LayoutList, Kanban } from 'lucide-react'

export const Route = createFileRoute('/candidates')({
  component: CandidatesPage,
})

function CandidatesPage() {

  return (
    <MainLayout>
      <Container className="h-full flex flex-col">
        <Outlet/>
      </Container>
    </MainLayout>
  )
}