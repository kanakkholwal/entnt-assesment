import { createFileRoute, Outlet } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import {  Container } from '@/components/layout/page-layout'

export const Route = createFileRoute('/assessments')({
  component: AssessmentsPage,
})

function AssessmentsPage() {


  return (
    <MainLayout>
      <Container>
        <Outlet/>
      </Container>
    </MainLayout>
  )
}