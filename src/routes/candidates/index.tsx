import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import { Container } from '@/components/layout/page-layout'
import { CandidatesList, KanbanBoard } from '@/components/candidates'
import { Button } from '@/components/ui/button'
import { LayoutList, Kanban } from 'lucide-react'

export const Route = createFileRoute('/candidates/')({
  component: CandidatesPage,
})

function CandidatesPage() {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')

  return (
    <>
        {/* View Toggle */}
        <div className="flex-shrink-0 p-4 border-b bg-card rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
              <p className="text-muted-foreground">
                Manage candidates and track their progress through the hiring pipeline
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <LayoutList  />
                List View
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <Kanban />
                Kanban Board
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {viewMode === 'list' ? (
            <CandidatesList className="h-full" />
          ) : (
            <KanbanBoard className="h-full" />
          )}
        </div>
    </>
  )
}