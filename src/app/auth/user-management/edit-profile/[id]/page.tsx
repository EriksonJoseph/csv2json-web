'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userManagementApi } from '@/lib/api'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { UserUpdateRequest } from '@/types'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
})

type ProfileForm = z.infer<typeof profileSchema>

interface EditProfilePageProps {
  params: {
    id: string
  }
}

export default function EditProfilePage({ params }: EditProfilePageProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const userId = params.id

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => userManagementApi.getUser(userId),
    select: (response) => response.data,
    enabled: !!user?.is_superuser,
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserUpdateRequest) =>
      userManagementApi.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User profile updated successfully!')
      router.push('/auth/user-management')
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to update user profile'
      )
    },
  })

  useEffect(() => {
    if (profile) {
      setValue('firstName', profile.first_name || '')
      setValue('middleName', profile.middle_name || '')
      setValue('lastName', profile.last_name || '')
      setValue('email', profile.email || '')
    }
  }, [profile, setValue])

  // Check if user is admin
  if (!user?.is_superuser) {
    router.push('/auth/dashboard')
    return null
  }

  const onSubmit = (data: ProfileForm) => {
    const updateData: UserUpdateRequest = {
      first_name: data.firstName,
      middle_name: data.middleName || undefined,
      last_name: data.lastName,
      email: data.email,
    }

    updateProfileMutation.mutate(updateData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/auth/user-management')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to User Management
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit User Profile
          </h1>
          {profile && (
            <p className="text-muted-foreground">
              Editing profile for @{profile.username}
            </p>
          )}
        </div>
      </div>

      <Card className="pt-4">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter first name"
                disabled={isLoading || updateProfileMutation.isPending}
                {...register('firstName')}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                type="text"
                placeholder="Enter middle name"
                disabled={isLoading || updateProfileMutation.isPending}
                {...register('middleName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter last name"
                disabled={isLoading || updateProfileMutation.isPending}
                {...register('lastName')}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                disabled={isLoading || updateProfileMutation.isPending}
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading || updateProfileMutation.isPending}
              >
                {isLoading
                  ? 'Loading...'
                  : updateProfileMutation.isPending
                    ? 'Updating...'
                    : 'Update Profile'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/auth/user-management')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
