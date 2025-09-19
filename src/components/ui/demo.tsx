// This is a demo component to test all UI components
import { useState } from "react"
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Input,
  Label,
  Badge,
  Alert,
  AlertDescription,
  LoadingSpinner,
  LoadingSkeleton,
  LoadingCard,
  AsyncWrapper,
  toast
} from "./index"

export function UIDemo() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToast = () => {
    toast.success("This is a success toast!")
  }

  const handleAsyncTest = () => {
    setLoading(true)
    setError(null)
    
    setTimeout(() => {
      setLoading(false)
      if (Math.random() > 0.5) {
        setError("Something went wrong!")
      }
    }, 2000)
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">UI Components Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Buttons & Badges</CardTitle>
            <CardDescription>Various button styles and badges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields and form controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="demo-input">Email</Label>
              <Input id="demo-input" type="email" placeholder="Enter your email" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>Various loading indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-center">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
            </div>
            <LoadingSkeleton lines={3} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Toast notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleToast}>Show Toast</Button>
            <Alert>
              <AlertDescription>
                This is an alert message.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Async Wrapper</CardTitle>
          <CardDescription>Test loading and error states</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAsyncTest} className="mb-4">
            Test Async State
          </Button>
          <AsyncWrapper 
            loading={loading} 
            error={error}
            onRetry={() => setError(null)}
          >
            <p>Content loaded successfully!</p>
          </AsyncWrapper>
        </CardContent>
      </Card>

      <LoadingCard />
    </div>
  )
}