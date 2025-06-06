import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <Loader2
      className={cn('animate-spin', sizeClasses[size], className)}
    />
  )
}

interface LoadingOverlayProps {
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function LoadingOverlay({ 
  message = 'Loading...', 
  size = 'lg', 
  className 
}: LoadingOverlayProps) {
  return (
    <div className={cn(
      'flex min-h-screen items-center justify-center',
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size={size} />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  )
}

interface LoadingCardProps {
  message?: string
  className?: string
}

export function LoadingCard({ message = 'Loading...', className }: LoadingCardProps) {
  return (
    <div className={cn(
      'flex items-center justify-center rounded-lg border p-6',
      className
    )}>
      <div className="flex items-center space-x-3">
        <LoadingSpinner />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  )
}

interface LoadingButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  className?: string
}

export function LoadingButton({ children, isLoading, className }: LoadingButtonProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {isLoading && <LoadingSpinner size="sm" />}
      <span>{children}</span>
    </div>
  )
}