import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'
import { PageLayout, Container } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/404')({
  component: NotFoundPage,
})

function NotFoundPage() {
  return (
    <MainLayout>
      <Container size="sm">
        <PageLayout className="text-center py-16">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-gray-900">404</h1>
              <h2 className="text-2xl font-semibold text-gray-700">Page Not Found</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </PageLayout>
      </Container>
    </MainLayout>
  )
}