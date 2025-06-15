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
import { authApi, usersApi } from '@/lib/api'
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

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const userId = user?.user_id
  const queryClient = useQueryClient()

  if (!userId) router.push('/')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => {
      return authApi.me().then((res) => res.data)
    },
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
      usersApi.updateProfile(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('Profile updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
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
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
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
                disabled={isLoading}
                {...register('middleName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter last name"
                disabled={isLoading}
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
                    : 'Submit'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
