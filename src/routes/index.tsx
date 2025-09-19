import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { PageLayout, Container } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Users, ClipboardList, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [mswStatus, setMswStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    // Check if MSW utilities are available
    const checkMSW = async () => {
      try {
        // Wait a bit for MSW to initialize
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        console.log('Checking MSW status...')
        console.log('Window mswUtils:', typeof window !== 'undefined' ? (window as any).mswUtils : 'undefined')
        console.log('Window debugUtils:', typeof window !== 'undefined' ? (window as any).debugUtils : 'undefined')
        
        if (typeof window !== 'undefined' && (window as any).mswUtils) {
          const config = (window as any).mswUtils.getConfig()
          setMswStatus('ready')
          
          // Try to get some data
          try {
            const jobsData = await (window as any).mswUtils.getJobs({ limit: 5 })
            const candidatesData = await (window as any).mswUtils.getCandidates({ limit: 5 })
            setStats({
              jobs: jobsData.pagination.total,
              candidates: candidatesData.pagination.total,
              errorRate: (config.errorRate * 100).toFixed(1)
            })
          } catch (error) {
            console.log('Data fetch error (expected with error simulation):', error)
          }
        } else {
          console.log('MSW utilities not available')
          setMswStatus('error')
        }
      } catch (error) {
        console.error('MSW check failed:', error)
        setMswStatus('error')
      }
    }

    checkMSW()
  }, [])

  const features = [
    {
      title: 'Jobs Management',
      description: 'Create, edit, and manage job postings with drag-and-drop reordering',
      icon: Briefcase,
      href: '/jobs',
      color: 'blue'
    },
    {
      title: 'Candidate Tracking',
      description: 'Track candidates through hiring stages with notes and timeline',
      icon: Users,
      href: '/candidates',
      color: 'green'
    },
    {
      title: 'Assessment Builder',
      description: 'Create custom assessments with various question types',
      icon: ClipboardList,
      href: '/assessments',
      color: 'purple'
    }
  ]

  return (
    <MainLayout>
      <Container>
        <PageLayout className="text-center py-8" showBreadcrumbs={false}>
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome to TalentFlow
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A comprehensive hiring platform with MSW mock API for seamless recruitment management
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  MSW Status
                  <Badge variant={mswStatus === 'ready' ? 'default' : mswStatus === 'loading' ? 'secondary' : 'destructive'}>
                    {mswStatus}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mswStatus === 'loading' && (
                  <div className="text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    Initializing Mock Service Worker...
                  </div>
                )}
                
                {mswStatus === 'ready' && (
                  <div className="text-green-600">
                    <div className="text-lg font-medium mb-2">✅ MSW Ready!</div>
                    {stats && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Jobs in database: {stats.jobs}</p>
                        <p>Candidates in database: {stats.candidates}</p>
                        <p>Error simulation rate: {stats.errorRate}%</p>
                      </div>
                    )}
                  </div>
                )}
                
                {mswStatus === 'error' && (
                  <div className="text-destructive">
                    <div className="text-lg font-medium">❌ MSW Not Available</div>
                    <p className="text-sm text-muted-foreground">Check console for errors</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-${feature.color}-100 flex items-center justify-center mb-4 mx-auto`}>
                        <Icon className={`h-6 w-6 text-${feature.color}-600`} />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full group-hover:bg-primary/90">
                        <Link to={feature.href}>
                          Get Started
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {process.env.NODE_ENV === 'development' && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Developer Tools</CardTitle>
                  <CardDescription>
                    Open browser console and try these commands:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-left text-xs font-mono bg-muted p-4 rounded-lg">
                    {mswStatus === 'ready' ? (
                      <div className="space-y-1">
                        <div>mswUtils.runTests() // Run all MSW tests</div>
                        <div>mswUtils.getJobs() // Fetch jobs data</div>
                        <div>mswUtils.getCandidates() // Fetch candidates data</div>
                        <div>mswUtils.resetData() // Reset all data</div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div>debugUtils.testDatabase() // Test database initialization</div>
                        <div>debugUtils.testMSW() // Test MSW initialization</div>
                        <div>debugUtils.testBoth() // Test both systems</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </PageLayout>
      </Container>
    </MainLayout>
  )
}
