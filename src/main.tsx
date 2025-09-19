import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'
import './debug' // Import debug utilities

// Initialize MSW (non-blocking)
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  try {
    console.log('[MSW] Starting Mock Service Worker initialization...')
    const { worker, initializeDataOnce } = await import('./mocks/browser')

    console.log('[MSW] Starting worker...')
    // Start the worker with quiet mode to reduce console noise
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: false
    })
    console.log('[MSW] Worker started successfully')

    console.log('[MSW] Initializing data...')
    // Initialize mock data (this will handle database initialization internally)
    await initializeDataOnce()
    
    console.log('[MSW] Mock Service Worker initialized successfully')
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

// Render the app immediately and initialize MSW in parallel
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}

// Initialize MSW in the background (non-blocking) with a small delay
setTimeout(() => {
  enableMocking()
}, 100)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
