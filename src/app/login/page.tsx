'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getAppVersion } from '@/lib/version'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean().default(false),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const router = useRouter()
  const { login, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      remember_me: false,
    },
    mode: 'onBlur', // Validate on blur to show errors immediately
  })

  const rememberMe = watch('remember_me')

  // Clear error when user starts typing
  const usernameValue = watch('username')
  const passwordValue = watch('password')

  useEffect(() => {
    if (loginError) {
      setLoginError(null)
    }
  }, [usernameValue, passwordValue, loginError])

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoginError(null) // Clear any previous errors
      await login(data)
      // Add a small delay to let the success toast show before redirecting
      setTimeout(() => {
        router.replace('/auth/dashboard')
      }, 500)
    } catch (error) {
      console.error('[AUTH] Login failed:', {
        username: data.username,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Extract error message and show it in the form
      let errorMessage =
        'Login failed. Please check your credentials and try again.'

      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response
        if (response?.data?.detail) {
          errorMessage = response.data.detail
        } else if (response?.data?.message) {
          errorMessage = response.data.message
        }
      }

      setLoginError(errorMessage)

      // Also show toast error for better visibility
      toast.error(errorMessage, { duration: 4000 })

      // Prevent any navigation/redirect by explicitly staying on the page
      // Form values are preserved automatically by react-hook-form
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access CSV2JSON Web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {loginError && (
              <div className="rounded-md bg-red-50 p-3 dark:bg-red-950">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Login Failed
                    </h3>
                    <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                      {loginError}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                disabled={isLoading}
                {...register('username')}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember_me"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setValue('remember_me', !!checked)
                }
                disabled={isLoading}
              />
              <Label htmlFor="remember_me" className="text-sm">
                Remember me
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              <LoadingButton isLoading={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </LoadingButton>
            </Button>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </CardContent>
        <div className="px-6 pb-6">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            Powered by Next.js • Developed by TORPONG • Version{' '}
            {getAppVersion()}
          </div>
        </div>
      </Card>
    </div>
  )
}
