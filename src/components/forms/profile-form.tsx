'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UseMutationResult } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingButton } from '@/components/ui/loading'
import { UserUpdateRequest } from '@/types/users'
import { useEffect } from 'react'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
})

type ProfileForm = z.infer<typeof profileSchema>

interface ProfileFormProps {
  mutation: UseMutationResult<any, any, UserUpdateRequest, any>
  initialData?: Partial<ProfileForm>
  title?: string
  description?: string
  submitText?: string
  onCancel?: () => void
  showCancelButton?: boolean
  disabled?: boolean
}

export function ProfileForm({
  mutation,
  initialData,
  title = 'Profile Information',
  description = 'Update your profile information',
  submitText = 'Update Profile',
  onCancel,
  showCancelButton = true,
  disabled = false,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        first_name: initialData.first_name || '',
        middle_name: initialData.middle_name || '',
        last_name: initialData.last_name || '',
        email: initialData.email || '',
      })
    }
  }, [initialData, reset])

  const onSubmit = async (data: ProfileForm) => {
    mutation.mutate(data)
  }

  const isLoading = mutation.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                placeholder="Enter first name"
                disabled={disabled || isLoading}
                {...register('first_name')}
                className={errors.first_name ? 'border-red-500' : ''}
              />
              {errors.first_name && (
                <p className="text-sm text-red-500">
                  {errors.first_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                placeholder="Enter middle name"
                disabled={disabled || isLoading}
                {...register('middle_name')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              placeholder="Enter last name"
              disabled={disabled || isLoading}
              {...register('last_name')}
              className={errors.last_name ? 'border-red-500' : ''}
            />
            {errors.last_name && (
              <p className="text-sm text-red-500">{errors.last_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              disabled={disabled || isLoading}
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Button type="submit" disabled={disabled || isLoading}>
              <LoadingButton isLoading={isLoading}>
                {isLoading ? 'Updating...' : submitText}
              </LoadingButton>
            </Button>
            {showCancelButton && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
