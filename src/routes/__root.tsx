import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ({ error }) => {
    console.error('Root route error:', error)
    
    // Redirect to 500 page for unhandled errors
    if (typeof window !== 'undefined') {
      window.location.href = '/500'
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Application Error</h1>
          <p className="text-gray-600 mb-4">Something went wrong. Redirecting...</p>
        </div>
      </div>
    )
  },
  notFoundComponent: () => {
    // Redirect to 404 page for not found routes
    if (typeof window !== 'undefined') {
      window.location.href = '/404'
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-4">Redirecting...</p>
        </div>
      </div>
    )
  },
})

function RootComponent() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
      {process.env.NODE_ENV === 'development' && (
        <TanstackDevtools
          config={{
            position: 'bottom-left',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
    </ErrorBoundary>
  )
}
