import { describe, it, expect } from 'vitest'
import { routes, parseRouteParams, isValidRoute, getRouteMetadata } from '@/lib/route-utils'

describe('Route Utils', () => {
  describe('routes', () => {
    it('should generate correct route paths', () => {
      expect(routes.home()).toBe('/')
      expect(routes.jobs()).toBe('/jobs')
      expect(routes.job('123')).toBe('/jobs/123')
      expect(routes.candidates()).toBe('/candidates')
      expect(routes.candidate('456')).toBe('/candidates/456')
      expect(routes.assessments()).toBe('/assessments')
      expect(routes.assessment('789')).toBe('/assessments/789')
      expect(routes.notFound()).toBe('/404')
      expect(routes.serverError()).toBe('/500')
    })
  })

  describe('parseRouteParams', () => {
    it('should parse job ID from job routes', () => {
      expect(parseRouteParams('/jobs/123')).toEqual({ jobId: '123' })
      expect(parseRouteParams('/jobs/test-job')).toEqual({ jobId: 'test-job' })
    })

    it('should parse candidate ID from candidate routes', () => {
      expect(parseRouteParams('/candidates/456')).toEqual({ id: '456' })
      expect(parseRouteParams('/candidates/test-candidate')).toEqual({ id: 'test-candidate' })
    })

    it('should parse job ID from assessment routes', () => {
      expect(parseRouteParams('/assessments/789')).toEqual({ jobId: '789' })
      expect(parseRouteParams('/assessments/test-assessment')).toEqual({ jobId: 'test-assessment' })
    })

    it('should return empty object for routes without params', () => {
      expect(parseRouteParams('/')).toEqual({})
      expect(parseRouteParams('/jobs')).toEqual({})
      expect(parseRouteParams('/candidates')).toEqual({})
      expect(parseRouteParams('/assessments')).toEqual({})
    })
  })

  describe('isValidRoute', () => {
    it('should validate correct routes', () => {
      expect(isValidRoute('/')).toBe(true)
      expect(isValidRoute('/jobs')).toBe(true)
      expect(isValidRoute('/jobs/123')).toBe(true)
      expect(isValidRoute('/candidates')).toBe(true)
      expect(isValidRoute('/candidates/456')).toBe(true)
      expect(isValidRoute('/assessments')).toBe(true)
      expect(isValidRoute('/assessments/789')).toBe(true)
      expect(isValidRoute('/404')).toBe(true)
      expect(isValidRoute('/500')).toBe(true)
    })

    it('should reject invalid routes', () => {
      expect(isValidRoute('/invalid')).toBe(false)
      expect(isValidRoute('/jobs/123/invalid')).toBe(false)
      expect(isValidRoute('/candidates/456/invalid')).toBe(false)
      expect(isValidRoute('')).toBe(false)
    })
  })

  describe('getRouteMetadata', () => {
    it('should return correct metadata for home route', () => {
      const metadata = getRouteMetadata('/')
      expect(metadata.title).toBe('Dashboard - TalentFlow')
      expect(metadata.breadcrumbs).toEqual([])
    })

    it('should return correct metadata for jobs routes', () => {
      const listMetadata = getRouteMetadata('/jobs')
      expect(listMetadata.title).toBe('Jobs - TalentFlow')
      expect(listMetadata.breadcrumbs).toEqual(['Home', 'Jobs'])

      const detailMetadata = getRouteMetadata('/jobs/123', { jobId: '123' })
      expect(detailMetadata.title).toBe('Job 123 - TalentFlow')
      expect(detailMetadata.breadcrumbs).toEqual(['Home', 'Jobs', 'Job 123'])
    })

    it('should return correct metadata for candidate routes', () => {
      const listMetadata = getRouteMetadata('/candidates')
      expect(listMetadata.title).toBe('Candidates - TalentFlow')
      expect(listMetadata.breadcrumbs).toEqual(['Home', 'Candidates'])

      const detailMetadata = getRouteMetadata('/candidates/456', { id: '456' })
      expect(detailMetadata.title).toBe('Candidate 456 - TalentFlow')
      expect(detailMetadata.breadcrumbs).toEqual(['Home', 'Candidates', 'Candidate 456'])
    })

    it('should return correct metadata for assessment routes', () => {
      const listMetadata = getRouteMetadata('/assessments')
      expect(listMetadata.title).toBe('Assessments - TalentFlow')
      expect(listMetadata.breadcrumbs).toEqual(['Home', 'Assessments'])

      const detailMetadata = getRouteMetadata('/assessments/789', { jobId: '789' })
      expect(detailMetadata.title).toBe('Assessment for Job 789 - TalentFlow')
      expect(detailMetadata.breadcrumbs).toEqual(['Home', 'Assessments', 'Job 789'])
    })

    it('should return correct metadata for error routes', () => {
      const notFoundMetadata = getRouteMetadata('/404')
      expect(notFoundMetadata.title).toBe('Page Not Found - TalentFlow')

      const serverErrorMetadata = getRouteMetadata('/500')
      expect(serverErrorMetadata.title).toBe('Server Error - TalentFlow')
    })
  })
})