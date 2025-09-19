import { Link, useRouterState } from '@tanstack/react-router'
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

export function Navigation({children}:{children:React.ReactNode}) {
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
          <nav className="flex flex-col space-y-2 mt-6 px-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.name}
                  variant={item.isActive ? "default_light" : "ghost"}
                  size="sm"
                  asChild
                  className="justify-start"
                >
                  <Link to={item.href}>
                    <Icon  />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
      {children}
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1">
        {navigation.slice(1).map((item) => { // Skip Dashboard for desktop nav
          const Icon = item.icon
          return (
            <Button
              key={item.name}
              variant={item.isActive ? "default_light" : "ghost"}
              size="sm"
              asChild
            >
              <Link
                to={item.href}
              >
                <Icon />
                {item.name}
              </Link>
            </Button>
          )
        })}
      </nav>


    </>
  )
}

export default Navigation