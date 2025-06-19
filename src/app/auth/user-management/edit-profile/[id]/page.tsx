'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { UserUpdateRequest } from '@/types'
import { ProfileForm } from '@/components/forms/profile-form'

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
    queryKey: ['user-profile', userId],
    queryFn: () => usersApi.getProfile(userId),
    select: (response) => response.data,
    enabled: user?.roles.includes('admin'),
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserUpdateRequest) =>
      usersApi.updateProfile(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User profile updated successfully!')
      router.push('/auth/user-management')
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to update user profile'
      )
    },
  })

  // Check if user is admin
  if (!user?.roles.includes('admin')) {
    router.push('/auth/dashboard')
    return null
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

      <ProfileForm
        mutation={updateProfileMutation}
        initialData={profile}
        title="User Profile Information"
        description="Update user profile information"
        submitText="Update User Profile"
        onCancel={() => router.push('/auth/user-management')}
        disabled={isLoading}
      />
    </div>
  )
}
