'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import { ChangePasswordRequest } from '@/types'

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Old password is required'),
    new_password: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirm_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const userId = user?.user_id

  if (!userId) router.push('/')

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      authApi.changePassword(userId!, data),
    onSuccess: () => {
      toast.success('Password changed successfully!')

      // Show alert requiring logout
      setTimeout(() => {
        const confirmLogout = window.confirm(
          'Your password has been changed successfully. You need to log out for security reasons. Click OK to continue.'
        )

        if (confirmLogout) {
          logout()
          router.push('/login')
        } else {
          // Force logout even if user cancels
          logout()
          router.push('/login')
        }
      }, 1000)
    },
    onError: (error: any) => {
      console.error('[AUTH] Change password failed:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        userId: userId,
      })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  const onSubmit = (data: ChangePasswordForm) => {
    const changePasswordData: ChangePasswordRequest = {
      current_password: data.current_password,
      new_password: data.new_password,
      confirm_password: data.confirm_password,
    }
    changePasswordMutation.mutate(changePasswordData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Change Password</h1>
        </div>
      </div>
      <Card className="pt-4">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Old Password *</Label>
              <Input
                id="current_password"
                type="password"
                placeholder="Enter your current password"
                disabled={changePasswordMutation.isPending}
                {...register('current_password')}
                className={errors.current_password ? 'border-red-500' : ''}
              />
              {errors.current_password && (
                <p className="text-sm text-red-500">
                  {errors.current_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password *</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="Enter your new password"
                disabled={changePasswordMutation.isPending}
                {...register('new_password')}
                className={errors.new_password ? 'border-red-500' : ''}
              />
              {errors.new_password && (
                <p className="text-sm text-red-500">
                  {errors.new_password.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters with uppercase,
                lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password *</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="Confirm your new password"
                disabled={changePasswordMutation.isPending}
                {...register('confirm_password')}
                className={errors.confirm_password ? 'border-red-500' : ''}
              />
              {errors.confirm_password && (
                <p className="text-sm text-red-500">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                <LoadingButton isLoading={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending
                    ? 'Changing Password...'
                    : 'Change Password'}
                </LoadingButton>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
