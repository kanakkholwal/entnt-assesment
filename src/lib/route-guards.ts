import { redirect } from '@tanstack/react-router'

/**
 * Route guard utilities for TanStack Router
 */

export interface RouteGuardContext {
  // Add authentication context when needed
  isAuthenticated?: boolean
  user?: any
  permissions?: string[]
}

/**
 * Authentication guard - redirects to home if not authenticated
 * Note: Update this when login route is implemented
 */
export function requireAuth(context: RouteGuardContext) {
  if (!context.isAuthenticated) {
    throw redirect({
      to: '/',
    })
  }
}

/**
 * Permission guard - redirects to 404 page if user lacks permissions
 * Note: Update this when unauthorized route is implemented
 */
export function requirePermission(context: RouteGuardContext, permission: string) {
  if (!context.permissions?.includes(permission)) {
    throw redirect({
      to: '/404',
    })
  }
}

/**
 * Admin guard - redirects if user is not admin
 */
export function requireAdmin(context: RouteGuardContext) {
  if (!context.permissions?.includes('admin')) {
    throw redirect({
      to: '/404',
    })
  }
}

/**
 * Guest guard - redirects authenticated users away from auth pages
 */
export function requireGuest(context: RouteGuardContext) {
  if (context.isAuthenticated) {
    throw redirect({
      to: '/',
    })
  }
}

/**
 * Validation guard - validates route parameters
 */
export function validateParams<T extends Record<string, any>>(
  params: T,
  validators: Record<keyof T, (value: any) => boolean>
): void {
  for (const [key, validator] of Object.entries(validators)) {
    if (!validator(params[key])) {
      throw redirect({
        to: '/404',
      })
    }
  }
}

/**
 * Common parameter validators
 */
export const validators = {
  uuid: (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
  id: (value: string) => /^[a-zA-Z0-9_-]+$/.test(value) && value.length > 0,
  slug: (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
  number: (value: string) => !isNaN(Number(value)) && Number(value) > 0,
}

/**
 * Example usage in route files:
 * 
 * export const Route = createFileRoute('/jobs/$jobId')({
 *   beforeLoad: ({ params }) => {
 *     validateParams(params, {
 *       jobId: validators.id
 *     })
 *   },
 *   component: JobDetailPage,
 * })
 */