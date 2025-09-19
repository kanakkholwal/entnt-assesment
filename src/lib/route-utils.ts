/**
 * Route utilities for TalentFlow application
 */

/**
 * Generate deep links for various entities
 */
export const routes = {
  home: () => '/',
  jobs: () => '/jobs',
  job: (jobId: string) => `/jobs/${jobId}`,
  candidates: () => '/candidates',
  candidate: (id: string) => `/candidates/${id}`,
  assessments: () => '/assessments',
  assessment: (jobId: string) => `/assessments/${jobId}`,
  notFound: () => '/404',
  serverError: () => '/500',
} as const

/**
 * Parse route parameters from pathname
 */
export function parseRouteParams(pathname: string): Record<string, string> {
  const params: Record<string, string> = {}
  
  // Parse job ID from /jobs/:jobId
  const jobMatch = pathname.match(/^\/jobs\/([^\/]+)$/)
  if (jobMatch) {
    params.jobId = jobMatch[1]
  }
  
  // Parse candidate ID from /candidates/:id
  const candidateMatch = pathname.match(/^\/candidates\/([^\/]+)$/)
  if (candidateMatch) {
    params.id = candidateMatch[1]
  }
  
  // Parse job ID from /assessments/:jobId
  const assessmentMatch = pathname.match(/^\/assessments\/([^\/]+)$/)
  if (assessmentMatch) {
    params.jobId = assessmentMatch[1]
  }
  
  return params
}

/**
 * Check if a route is valid
 */
export function isValidRoute(pathname: string): boolean {
  const validRoutes = [
    /^\/$/,                           // Home
    /^\/jobs$/,                       // Jobs list
    /^\/jobs\/[^\/]+$/,              // Job detail
    /^\/candidates$/,                 // Candidates list
    /^\/candidates\/[^\/]+$/,        // Candidate detail
    /^\/assessments$/,               // Assessments list
    /^\/assessments\/[^\/]+$/,       // Assessment builder
    /^\/404$/,                       // Not found
    /^\/500$/,                       // Server error
  ]
  
  return validRoutes.some(pattern => pattern.test(pathname))
}

/**
 * Get route metadata for SEO and navigation
 */
export function getRouteMetadata(pathname: string, params?: Record<string, string>) {
  const metadata = {
    title: 'TalentFlow',
    description: 'Comprehensive hiring platform',
    breadcrumbs: [] as string[],
  }
  
  if (pathname === '/') {
    metadata.title = 'Dashboard - TalentFlow'
    metadata.description = 'Welcome to TalentFlow hiring platform'
  } else if (pathname === '/jobs') {
    metadata.title = 'Jobs - TalentFlow'
    metadata.description = 'Manage job postings and requirements'
    metadata.breadcrumbs = ['Home', 'Jobs']
  } else if (pathname.startsWith('/jobs/') && params?.jobId) {
    metadata.title = `Job ${params.jobId} - TalentFlow`
    metadata.description = `View and manage job ${params.jobId}`
    metadata.breadcrumbs = ['Home', 'Jobs', `Job ${params.jobId}`]
  } else if (pathname === '/candidates') {
    metadata.title = 'Candidates - TalentFlow'
    metadata.description = 'Manage candidates and track their progress'
    metadata.breadcrumbs = ['Home', 'Candidates']
  } else if (pathname.startsWith('/candidates/') && params?.id) {
    metadata.title = `Candidate ${params.id} - TalentFlow`
    metadata.description = `View candidate ${params.id} profile and timeline`
    metadata.breadcrumbs = ['Home', 'Candidates', `Candidate ${params.id}`]
  } else if (pathname === '/assessments') {
    metadata.title = 'Assessments - TalentFlow'
    metadata.description = 'Create and manage job assessments'
    metadata.breadcrumbs = ['Home', 'Assessments']
  } else if (pathname.startsWith('/assessments/') && params?.jobId) {
    metadata.title = `Assessment for Job ${params.jobId} - TalentFlow`
    metadata.description = `Create and edit assessments for job ${params.jobId}`
    metadata.breadcrumbs = ['Home', 'Assessments', `Job ${params.jobId}`]
  } else if (pathname === '/404') {
    metadata.title = 'Page Not Found - TalentFlow'
    metadata.description = 'The page you are looking for does not exist'
  } else if (pathname === '/500') {
    metadata.title = 'Server Error - TalentFlow'
    metadata.description = 'Something went wrong on our end'
  }
  
  return metadata
}

/**
 * Navigation helper for programmatic navigation
 */
export function createNavigationHelper(navigate: (to: string) => void) {
  return {
    goHome: () => navigate(routes.home()),
    goToJobs: () => navigate(routes.jobs()),
    goToJob: (jobId: string) => navigate(routes.job(jobId)),
    goToCandidates: () => navigate(routes.candidates()),
    goToCandidate: (id: string) => navigate(routes.candidate(id)),
    goToAssessments: () => navigate(routes.assessments()),
    goToAssessment: (jobId: string) => navigate(routes.assessment(jobId)),
    goToNotFound: () => navigate(routes.notFound()),
    goToServerError: () => navigate(routes.serverError()),
  }
}