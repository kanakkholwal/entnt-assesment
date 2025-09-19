import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import { PageLayout, Container } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { Home, RefreshCw } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/500')({
  component: ServerErrorPage,
})

function ServerErrorPage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <MainLayout>
      <Container size="sm">
        <PageLayout className="text-center py-16">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-red-600">500</h1>
              <h2 className="text-2xl font-semibold text-gray-700">Server Error</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Something went wrong on our end. Please try again later or contact support if the problem persists.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>
          </div>
        </PageLayout>
      </Container>
    </MainLayout>
  )
}