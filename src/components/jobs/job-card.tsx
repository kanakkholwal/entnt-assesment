import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Archive, ArchiveRestore, Edit, Eye, MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Job } from '@/types/job'

interface JobCardProps {
  job: Job
  onEdit?: (job: Job) => void
  onToggleStatus?: (job: Job) => void
  onView?: (job: Job) => void
  draggable?: boolean
}

export function JobCard({ 
  job, 
  onEdit, 
  onToggleStatus, 
  onView,
  draggable = false 
}: JobCardProps) {
  const isActive = job.status === 'active'
  
  const handleEdit = () => {
    onEdit?.(job)
  }
  
  const handleToggleStatus = () => {
    onToggleStatus?.(job)
  }
  
  const handleView = () => {
    onView?.(job)
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      draggable ? 'cursor-grab active:cursor-grabbing' : ''
    } ${!isActive ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold leading-none tracking-tight">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              /{job.slug}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {job.status}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Job
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleStatus}>
                  {isActive ? (
                    <>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Job
                    </>
                  ) : (
                    <>
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                      Activate Job
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      {(job.description || job.tags.length > 0) && (
        <CardContent className="pb-3">
          {job.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {job.description}
            </p>
          )}
          
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}
      
      <CardFooter className="pt-3 text-xs text-muted-foreground">
        <div className="flex items-center justify-between w-full">
          <span>
            Created {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </span>
          {job.updatedAt !== job.createdAt && (
            <span>
              Updated {formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}