import { Link, useRouterState, useParams } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

export function Breadcrumbs() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  
  // Try to get params from the current route
  let params: Record<string, string> = {}
  try {
    params = useParams({ strict: false }) as Record<string, string>
  } catch {
    // If useParams fails, extract from pathname
    const jobMatch = pathname.match(/^\/jobs\/([^\/]+)$/)
    const candidateMatch = pathname.match(/^\/candidates\/([^\/]+)$/)
    const assessmentMatch = pathname.match(/^\/assessments\/([^\/]+)$/)
    
    if (jobMatch) params.jobId = jobMatch[1]
    if (candidateMatch) params.id = candidateMatch[1]
    if (assessmentMatch) params.jobId = assessmentMatch[1]
  }

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ]

    if (pathname === '/') {
      breadcrumbs[0].isActive = true
      return breadcrumbs
    }

    if (pathname.startsWith('/jobs')) {
      breadcrumbs.push({ label: 'Jobs', href: '/jobs' })
      
      if (pathname.includes('/$jobId') && params.jobId) {
        breadcrumbs.push({ 
          label: `Job ${params.jobId}`, 
          isActive: true 
        })
      } else if (pathname === '/jobs') {
        breadcrumbs[breadcrumbs.length - 1].isActive = true
      }
    }

    if (pathname.startsWith('/candidates')) {
      breadcrumbs.push({ label: 'Candidates', href: '/candidates' })
      
      if (pathname.includes('/$id') && params.id) {
        breadcrumbs.push({ 
          label: `Candidate ${params.id}`, 
          isActive: true 
        })
      } else if (pathname === '/candidates') {
        breadcrumbs[breadcrumbs.length - 1].isActive = true
      }
    }

    if (pathname.startsWith('/assessments')) {
      breadcrumbs.push({ label: 'Assessments', href: '/assessments' })
      
      if (pathname.includes('/$jobId') && params.jobId) {
        breadcrumbs.push({ 
          label: `Assessment for Job ${params.jobId}`, 
          isActive: true 
        })
      } else if (pathname === '/assessments') {
        breadcrumbs[breadcrumbs.length - 1].isActive = true
      }
    }

    if (pathname === '/404') {
      breadcrumbs.push({ label: 'Page Not Found', isActive: true })
    }

    if (pathname === '/500') {
      breadcrumbs.push({ label: 'Server Error', isActive: true })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1" />
          )}
          
          {breadcrumb.href && !breadcrumb.isActive ? (
            <Link
              to={breadcrumb.href}
              className={cn(
                "hover:text-foreground transition-colors flex items-center",
                index === 0 && "flex items-center gap-1"
              )}
            >
              {index === 0 && <Home className="h-4 w-4" />}
              {breadcrumb.label}
            </Link>
          ) : (
            <span 
              className={cn(
                "flex items-center",
                breadcrumb.isActive && "text-foreground font-medium",
                index === 0 && "gap-1"
              )}
            >
              {index === 0 && <Home className="h-4 w-4" />}
              {breadcrumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

export default Breadcrumbs