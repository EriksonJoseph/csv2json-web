'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { authApi, usersApi } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import { VerifyEmailRequest } from '@/types'

const verifyEmailSchema = z
  .object({
    password: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

type VerifyEmailForm = z.infer<typeof verifyEmailSchema>

export default function VerifyEmailPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      toast.error('Invalid verification link')
      router.push('/login')
      return
    }
    setToken(tokenParam)
  }, [searchParams, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailForm>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      password: '',
      confirm_password: '',
    },
  })

  const verifyEmailMutation = useMutation({
    mutationFn: (data: VerifyEmailRequest) => usersApi.verifyEmail(data),
    onSuccess: (data: any) => {
      toast.success('Veriry Email & Create password successfully!')
      console.log(`🚀🙈 TORPONG [page.tsx] success data`, data)
      setTimeout(() => {
        router.replace('/login')
      }, 1000)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    },
  })

  const isLoading = verifyEmailMutation.isPending

  console.log(`🚀🙈 TORPONG [page.tsx] isLoading`, isLoading)

  const onSubmit = async (data: VerifyEmailForm) => {
    if (!token) {
      toast.error('Invalid verification token')
      return
    }

    verifyEmailMutation.mutate({ ...data, token })
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>Invalid verification link. Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-center">
            Create a password to complete your account setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...register('confirm_password')}
                  className={
                    errors.confirm_password ? 'border-red-500 pr-10' : 'pr-10'
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-red-500">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              <LoadingButton isLoading={isLoading}>
                {isLoading ? 'Loading....' : 'Verify Email & Create Password'}
              </LoadingButton>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
