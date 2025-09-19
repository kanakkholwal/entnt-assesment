import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { 
  Briefcase, 
  Users, 
  ClipboardList, 
  Menu,
  Home
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
}

export function Navigation() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      isActive: currentPath === '/'
    },
    {
      name: 'Jobs',
      href: '/jobs',
      icon: Briefcase,
      isActive: currentPath.startsWith('/jobs')
    },
    {
      name: 'Candidates', 
      href: '/candidates',
      icon: Users,
      isActive: currentPath.startsWith('/candidates')
    },
    {
      name: 'Assessments',
      href: '/assessments', 
      icon: ClipboardList,
      isActive: currentPath.startsWith('/assessments')
    }
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1">
        {navigation.slice(1).map((item) => { // Skip Dashboard for desktop nav
          const Icon = item.icon
          return (
            <Button 
              key={item.name} 
              variant={item.isActive ? "secondary" : "ghost"} 
              size="sm" 
              asChild
            >
              <Link 
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-2",
                  item.isActive 
                    ? "text-primary bg-muted" 
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          )
        })}
      </nav>

      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>
              Navigate through TalentFlow sections
            </SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col space-y-2 mt-6">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Button 
                  key={item.name} 
                  variant={item.isActive ? "secondary" : "ghost"} 
                  size="sm" 
                  asChild
                  className="justify-start"
                >
                  <Link 
                    to={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors flex items-center gap-3 w-full",
                      item.isActive 
                        ? "text-primary bg-muted" 
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default Navigation