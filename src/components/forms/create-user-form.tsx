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
import { UserCreateRequest } from '@/types/users'
import { useEffect } from 'react'

const createUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
})

type CreateUserForm = z.infer<typeof createUserSchema>

interface CreateUserFormProps {
  mutation: UseMutationResult<any, any, UserCreateRequest, any>
  title?: string
  description?: string
  submitText?: string
  onCancel?: () => void
  showCancelButton?: boolean
  disabled?: boolean
}

export function CreateUserForm({
  mutation,
  title = 'User Information',
  description = 'Create a new user account',
  submitText = 'Create User',
  onCancel,
  showCancelButton = true,
  disabled = false,
}: CreateUserFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
    },
  })

  const email = watch('email')

  // Auto-populate username from email
  useEffect(() => {
    if (email) {
      const username = email.split('@')[0]
      setValue('username', username)
    }
  }, [email, setValue])

  const onSubmit = async (data: CreateUserForm) => {
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

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="Username (auto-generated from email)"
              disabled={true}
              {...register('username')}
              className={`bg-muted ${errors.username ? 'border-red-500' : ''}`}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Username is automatically generated from the email address
            </p>
          </div>

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

          <div className="space-y-4 pt-4">
            <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-950">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> After creating the user, a verification
                email will be automatically sent to the provided email address.
                The new user will need to click the verification link to set up
                their password and activate their account.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button type="submit" disabled={disabled || isLoading}>
                <LoadingButton isLoading={isLoading}>
                  {isLoading ? 'Creating...' : submitText}
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
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
