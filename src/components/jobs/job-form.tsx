import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { Job, CreateJobRequest, UpdateJobRequest } from '@/types/job'

const jobFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  requirements: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

type JobFormData = z.infer<typeof jobFormSchema>

interface JobFormProps {
  job?: Job
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateJobRequest | UpdateJobRequest) => Promise<void>
  loading?: boolean
}

export function JobForm({ job, open, onOpenChange, onSubmit, loading = false }: JobFormProps) {
  const isEditing = !!job
  
  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      requirements: [],
      tags: [],
    },
  })

  const { watch, setValue, reset } = form
  const watchedTitle = watch('title')

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && watchedTitle) {
      const generatedSlug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setValue('slug', generatedSlug)
    }
  }, [watchedTitle, isEditing, setValue])

  // Reset form when job changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (job) {
        reset({
          title: job.title,
          slug: job.slug,
          description: job.description || '',
          requirements: job.requirements || [],
          tags: job.tags || [],
        })
      } else {
        reset({
          title: '',
          slug: '',
          description: '',
          requirements: [],
          tags: [],
        })
      }
    }
  }, [job, open, reset])

  const handleSubmit = async (data: JobFormData) => {
    try {
      await onSubmit(data)
      onOpenChange(false)
      reset()
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Form submission error:', error)
    }
  }

  const addRequirement = () => {
    const currentRequirements = form.getValues('requirements') || []
    setValue('requirements', [...currentRequirements, ''])
  }

  const updateRequirement = (index: number, value: string) => {
    const currentRequirements = form.getValues('requirements') || []
    const newRequirements = [...currentRequirements]
    newRequirements[index] = value
    setValue('requirements', newRequirements)
  }

  const removeRequirement = (index: number) => {
    const currentRequirements = form.getValues('requirements') || []
    const newRequirements = currentRequirements.filter((_, i) => i !== index)
    setValue('requirements', newRequirements)
  }

  const addTag = (tagInput: string) => {
    const tag = tagInput.trim()
    if (!tag) return

    const currentTags = form.getValues('tags') || []
    if (!currentTags.includes(tag)) {
      setValue('tags', [...currentTags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || []
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const input = e.currentTarget
      addTag(input.value)
      input.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Job' : 'Create New Job'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the job details below.' 
              : 'Fill in the details to create a new job posting.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Frontend Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *
                      <span className='text-xs font-light'>(URL-friendly identifier for this job)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. senior-frontend-developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Requirements</FormLabel>
              <FormDescription>
                List the key requirements for this position
              </FormDescription>
              
              {(form.watch('requirements') || []).map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRequirement(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequirement}
              >
                Add Requirement
              </Button>
            </div>

            <div className="space-y-3">
              <FormLabel>Tags</FormLabel>
              <FormDescription>
                Add tags to categorize this job (press Enter to add)
              </FormDescription>
              
              <Input
                placeholder="e.g. React, TypeScript, Remote"
                onKeyDown={handleTagKeyDown}
              />
              
              {(form.watch('tags') || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(form.watch('tags') || []).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-2 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Update Job' : 'Create Job')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}