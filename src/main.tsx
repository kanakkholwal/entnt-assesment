import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import './debug' // Import debug utilities

// Initialize MSW (non-blocking)
async function enableMocking() {
  // if (process.env.NODE_ENV !== 'development') {
  //   return 
  // }

  try {
    console.log('[MSW] Starting Mock Service Worker initialization...')
    const { worker, initializeDataOnce } = await import('./mocks/browser')

    console.log('[MSW] Starting worker...')
    // Start the worker with proper configuration
    await worker.start({
      onUnhandledRequest: 'warn',
      quiet: false,
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    })
    console.log('[MSW] Worker started successfully')

    console.log('[MSW] Initializing data...')
    // Initialize mock data (this will handle database initialization internally)
    await initializeDataOnce()
    
    console.log('[MSW] Mock Service Worker initialized successfully');
    
    // Add a global flag to indicate MSW is ready
    (window as any).__MSW_READY__ = true
  } catch (error) {
    console.error('[MSW] Failed to initialize Mock Service Worker:', error)
    console.error('[MSW] Error details:', error instanceof Error ? error.message : String(error))
    // Don't throw - let the app continue without MSW
  }
}

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
// Initialize MSW first, then render the app
async function startApp() {
  // Initialize MSW first
  await enableMocking()
  
  // Then render the app
  const rootElement = document.getElementById('app')
  if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    )
  }
}

// Start the application
startApp().catch(error => {
  console.error('Failed to start application:', error)
  // Render app anyway if MSW fails
  const rootElement = document.getElementById('app')
  if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    )
  }
})


